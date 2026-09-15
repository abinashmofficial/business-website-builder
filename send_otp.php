<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/env.php';

Env::load();

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
$appPassword = isset($data['app_password']) ? trim($data['app_password']) : '';

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Invalid email address']);
    exit;
}

$otp = (string)random_int(100000, 999999);
Database::saveOtp($email, $otp);

$config = [
    'smtp_host' => Env::get('SMTP_HOST', 'smtp.gmail.com'),
    'smtp_port' => (int)Env::get('SMTP_PORT', 465),
    'smtp_user' => Env::get('SMTP_USER', ''),
    'smtp_pass' => Env::get('SMTP_PASS', ''),
    'from_email' => Env::get('FROM_EMAIL', 'no-reply@enterprisebuilder.app'),
    'from_name' => Env::get('FROM_NAME', 'EnterpriseBuilder Security')
];

if (file_exists(__DIR__ . '/smtp_config.php')) {
    $customConfig = include __DIR__ . '/smtp_config.php';
    if (is_array($customConfig)) {
        $config = array_merge($config, $customConfig);
    }
}

if (!empty($appPassword)) {
    $config['smtp_user'] = $email;
    $config['smtp_pass'] = $appPassword;
    $savedConfig = "<?php\nreturn [\n    'smtp_host' => 'smtp.gmail.com',\n    'smtp_port' => 465,\n    'smtp_user' => " . var_export($email, true) . ",\n    'smtp_pass' => " . var_export($appPassword, true) . ",\n    'from_email' => " . var_export($email, true) . ",\n    'from_name' => 'EnterpriseBuilder Security'\n];\n";
    @file_put_contents(__DIR__ . '/smtp_config.php', $savedConfig);
}

if (empty($config['smtp_user']) && strpos($email, '@gmail.com') !== false && !empty($config['smtp_pass'])) {
    $config['smtp_user'] = $email;
}

$subject = "EnterpriseBuilder Google Verification Code: " . $otp;

$textBody = "EnterpriseBuilder Google Account Verification\n\n" .
            "Your 6-digit verification code is: " . $otp . "\n\n" .
            "This code will expire in 10 minutes.\n" .
            "If you did not request this code, you can safely ignore this email.\n\n" .
            "EnterpriseBuilder Security Team";

$htmlBody = '<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
.card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
.header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; }
.title { font-size: 20px; font-weight: 700; color: #1e1b4b; margin: 0; }
.otp-box { background: #f3f0ff; border: 2px dashed #6366f1; border-radius: 12px; text-align: center; padding: 20px; margin: 24px 0; }
.otp-code { font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; }
.hint { font-size: 14px; color: #64748b; line-height: 1.6; }
.footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <h2 class="title">EnterpriseBuilder Verification</h2>
  </div>
  <p class="hint">Hello,</p>
  <p class="hint">Please use the following 6-digit verification code to complete your Google account authentication:</p>
  <div class="otp-box">
    <div class="otp-code">' . htmlspecialchars($otp) . '</div>
  </div>
  <p class="hint">This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.</p>
  <div class="footer">
    Sent securely by EnterpriseBuilder Security &bull; Protecting your workspace
  </div>
</div>
</body>
</html>';

function sendViaSmtp($host, $port, $user, $pass, $from, $fromName, $to, $subject, $htmlBody, $textBody) {
    $cleanPass = str_replace(' ', '', $pass);
    $remote = ($port == 465) ? "ssl://{$host}" : $host;
    $socket = @fsockopen($remote, $port, $errno, $errstr, 12);
    if (!$socket) {
        return ['success' => false, 'error' => "Cannot connect to SMTP server {$host}:{$port}"];
    }

    $read = function() use ($socket) {
        $res = '';
        while ($line = fgets($socket, 512)) {
            $res .= $line;
            if (strlen($line) >= 4 && substr($line, 3, 1) === ' ') {
                break;
            }
        }
        return $res;
    };

    $write = function($cmd) use ($socket) {
        fputs($socket, $cmd . "\r\n");
    };

    $greeting = $read();
    if (substr($greeting, 0, 3) !== '220') {
        fclose($socket);
        return ['success' => false, 'error' => "SMTP greeting failed"];
    }

    $write("EHLO " . gethostname());
    $ehlo = $read();

    if ($port == 587 || $port == 25) {
        $write("STARTTLS");
        $tls = $read();
        if (substr($tls, 0, 3) === '220') {
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT)) {
                fclose($socket);
                return ['success' => false, 'error' => "TLS negotiation failed"];
            }
            $write("EHLO " . gethostname());
            $read();
        }
    }

    if (!empty($user) && !empty($cleanPass)) {
        $write("AUTH LOGIN");
        $authRes = $read();
        if (substr($authRes, 0, 3) !== '334') {
            fclose($socket);
            return ['success' => false, 'error' => "AUTH LOGIN rejected"];
        }

        $write(base64_encode($user));
        $uRes = $read();
        if (substr($uRes, 0, 3) !== '334') {
            fclose($socket);
            return ['success' => false, 'error' => "Username rejected"];
        }

        $write(base64_encode($cleanPass));
        $pRes = $read();
        if (substr($pRes, 0, 3) !== '235') {
            fclose($socket);
            return ['success' => false, 'error' => "Authentication failed. Please verify your App Password."];
        }
    }

    $fromAddress = !empty($user) ? $user : $from;
    $write("MAIL FROM: <{$fromAddress}>");
    $mfRes = $read();
    if (substr($mfRes, 0, 3) !== '250') {
        fclose($socket);
        return ['success' => false, 'error' => "MAIL FROM rejected"];
    }

    $write("RCPT TO: <{$to}>");
    $rcRes = $read();
    if (substr($rcRes, 0, 3) !== '250' && substr($rcRes, 0, 3) !== '251') {
        fclose($socket);
        return ['success' => false, 'error' => "RCPT TO rejected"];
    }

    $write("DATA");
    $dataRes = $read();
    if (substr($dataRes, 0, 3) !== '354') {
        fclose($socket);
        return ['success' => false, 'error' => "DATA rejected"];
    }

    $boundary = "----=_Part_" . md5(uniqid(rand(), true));
    $msg = "MIME-Version: 1.0\r\n";
    $msg .= "From: {$fromName} <{$fromAddress}>\r\n";
    $msg .= "To: <{$to}>\r\n";
    $msg .= "Subject: {$subject}\r\n";
    $msg .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n\r\n";
    $msg .= "--{$boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n{$textBody}\r\n\r\n";
    $msg .= "--{$boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n{$htmlBody}\r\n\r\n";
    $msg .= "--{$boundary}--\r\n.\r\n";

    $write($msg);
    $sendRes = $read();
    if (substr($sendRes, 0, 3) !== '250') {
        fclose($socket);
        return ['success' => false, 'error' => "Failed to deliver message"];
    }

    $write("QUIT");
    fclose($socket);
    return ['success' => true];
}

$sent = false;
$errorDetail = '';

if (!empty($config['smtp_user']) && !empty($config['smtp_pass'])) {
    $smtpResult = sendViaSmtp(
        $config['smtp_host'],
        $config['smtp_port'],
        $config['smtp_user'],
        $config['smtp_pass'],
        $config['from_email'],
        $config['from_name'],
        $email,
        $subject,
        $htmlBody,
        $textBody
    );
    if ($smtpResult['success']) {
        $sent = true;
    } else {
        $errorDetail = $smtpResult['error'];
    }
} else {
    $headers = "MIME-Version: 1.0\r\n" .
               "Content-type: text/html; charset=UTF-8\r\n" .
               "From: {$config['from_name']} <{$config['from_email']}>\r\n" .
               "Reply-To: {$config['from_email']}\r\n" .
               "X-Mailer: PHP/" . phpversion();

    $mailResult = @mail($email, $subject, $htmlBody, $headers);
    if ($mailResult) {
        $sent = true;
    } else {
        $errorDetail = 'Failed to deliver OTP to Google Mail. Please verify server SMTP configuration.';
    }
}

if ($sent) {
    echo json_encode([
        'success' => true,
        'delivered' => true,
        'message' => 'Verification code sent to ' . $email
    ]);
} else {
    echo json_encode([
        'success' => false,
        'delivered' => false,
        'error' => $errorDetail
    ]);
}
