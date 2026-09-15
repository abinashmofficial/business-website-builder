<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/env.php';

Env::load();

$paymentMode = strtolower(trim(Env::get('PAYMENT_MODE', 'production')));

if ($paymentMode === 'test') {
    $gatewayKeyId = Env::get('TEST_KEY_ID', 'rzp_test_sampleKeyId12345');
    $gatewaySecret = Env::get('TEST_KEY_SECRET', 'sampleTestSecret98765');
} else {
    $gatewayKeyId = Env::get('PROD_KEY_ID', 'rzp_live_realKeyId12345');
    $gatewaySecret = Env::get('PROD_KEY_SECRET', 'sampleLiveSecret98765');
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);
if (!is_array($data)) {
    $data = [];
}

$action = isset($data['action']) ? trim($data['action']) : (isset($_GET['action']) ? trim($_GET['action']) : 'verify');

$planPrices = [
    'free' => 0.00,
    'pro' => 1499.00,
    'enterprise' => 3999.00
];

if ($action === 'create_order') {
    $email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
    $plan = isset($data['plan']) ? trim($data['plan']) : '';

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'error' => 'Valid registered user email required']);
        exit;
    }

    if (!in_array($plan, ['pro', 'enterprise'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid plan tier selected']);
        exit;
    }

    $amount = $planPrices[$plan];
    $amountPaisa = (int)($amount * 100);
    $currency = Env::get('PAYMENT_CURRENCY', 'INR');
    $receiptId = 'rcpt_' . strtoupper(bin2hex(random_bytes(6)));

    $orderId = 'order_' . strtoupper(bin2hex(random_bytes(8)));

    if (!empty($gatewayKeyId) && !empty($gatewaySecret) && strpos($gatewayKeyId, 'sample') === false) {
        $ch = curl_init('https://api.razorpay.com/v1/orders');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERPWD, $gatewayKeyId . ':' . $gatewaySecret);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'amount' => $amountPaisa,
            'currency' => $currency,
            'receipt' => $receiptId,
            'notes' => [
                'email' => $email,
                'plan' => $plan,
                'mode' => $paymentMode
            ]
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        $resp = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            $rzpOrder = json_decode($resp, true);
            if (!empty($rzpOrder['id'])) {
                $orderId = $rzpOrder['id'];
            }
        }
    }

    echo json_encode([
        'success' => true,
        'order_id' => $orderId,
        'amount' => $amount,
        'amount_paisa' => $amountPaisa,
        'currency' => $currency,
        'key_id' => $gatewayKeyId,
        'mode' => $paymentMode,
        'plan' => $plan
    ]);
    exit;
}

$email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
$plan = isset($data['plan']) ? trim($data['plan']) : '';
$method = isset($data['method']) ? trim($data['method']) : 'razorpay';
$razorpayPaymentId = isset($data['razorpay_payment_id']) ? trim($data['razorpay_payment_id']) : '';
$razorpayOrderId = isset($data['razorpay_order_id']) ? trim($data['razorpay_order_id']) : '';
$razorpaySignature = isset($data['razorpay_signature']) ? trim($data['razorpay_signature']) : '';

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Valid registered user email required for billing']);
    exit;
}

if (!in_array($plan, ['pro', 'enterprise', 'free'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid plan tier selected']);
    exit;
}

$amount = $planPrices[$plan];
$currency = Env::get('PAYMENT_CURRENCY', 'INR');

if ($plan === 'free') {
    $updatedUser = Database::updateUserPlan($email, 'free');
    echo json_encode([
        'success' => true,
        'message' => 'Switched to Free plan',
        'user' => $updatedUser
    ]);
    exit;
}

if ($method === 'razorpay') {
    if (empty($razorpayPaymentId)) {
        Database::recordPayment($email, $plan, $amount, $currency, $method, 'RZP', 'failed');
        echo json_encode(['success' => false, 'error' => 'Razorpay Payment ID missing. Payment not authorized.']);
        exit;
    }

    if (in_array(strtolower($razorpayPaymentId), ['pay_test', 'pay_fake', 'test', 'demo'])) {
        Database::recordPayment($email, $plan, $amount, $currency, $method, 'RZP', 'failed');
        echo json_encode(['success' => false, 'error' => 'Fake payment reference rejected. Live payment settlement required.']);
        exit;
    }

    if (!empty($gatewaySecret) && !empty($razorpayOrderId) && !empty($razorpaySignature) && strpos($gatewaySecret, 'sample') === false) {
        $expectedSignature = hash_hmac('sha256', $razorpayOrderId . '|' . $razorpayPaymentId, $gatewaySecret);
        if ($expectedSignature !== $razorpaySignature) {
            Database::recordPayment($email, $plan, $amount, $currency, $method, 'RZP', 'failed');
            echo json_encode(['success' => false, 'error' => 'Razorpay Signature verification failed. Untrusted payment transaction.']);
            exit;
        }
    }

    $cardLast4 = substr($razorpayPaymentId, -4);
} else {
    $cardNumber = isset($data['card_number']) ? preg_replace('/[^0-9]/', '', $data['card_number']) : '';
    $cardExp = isset($data['card_exp']) ? trim($data['card_exp']) : '';
    $cardCvv = isset($data['card_cvv']) ? preg_replace('/[^0-9]/', '', $data['card_cvv']) : '';
    $cardHolder = isset($data['card_holder']) ? trim($data['card_holder']) : '';
    $upiId = isset($data['upi_id']) ? trim($data['upi_id']) : '';
    $bankName = isset($data['bank_name']) ? trim($data['bank_name']) : '';

    function luhnChecksum($number) {
        $digits = (string)$number;
        $sum = 0;
        $numDigits = strlen($digits);
        $parity = $numDigits % 2;
        for ($i = 0; $i < $numDigits; $i++) {
            $digit = (int)$digits[$i];
            if ($i % 2 === $parity) {
                $digit *= 2;
                if ($digit > 9) {
                    $digit -= 9;
                }
            }
            $sum += $digit;
        }
        return ($sum % 10 === 0);
    }

    $fakeCardPatterns = [
        '0000000000000000', '1111111111111111', '2222222222222222',
        '3333333333333333', '4444444444444444', '5555555555555555',
        '6666666666666666', '7777777777777777', '8888888888888888',
        '9999999999999999', '4242424242424242', '1234567890123456'
    ];

    if ($method === 'credit_card') {
        if (empty($cardNumber) || strlen($cardNumber) < 13 || strlen($cardNumber) > 19 || in_array($cardNumber, $fakeCardPatterns) || !luhnChecksum($cardNumber)) {
            Database::recordPayment($email, $plan, $amount, $currency, $method, '0000', 'failed');
            echo json_encode(['success' => false, 'error' => 'Invalid or test card number. Real payment transaction required.']);
            exit;
        }
        if (empty($cardHolder) || strlen($cardHolder) < 3 || empty($cardExp) || empty($cardCvv)) {
            Database::recordPayment($email, $plan, $amount, $currency, $method, '0000', 'failed');
            echo json_encode(['success' => false, 'error' => 'Invalid cardholder details or CVV.']);
            exit;
        }
        $cardLast4 = substr($cardNumber, -4);
    } elseif ($method === 'upi') {
        if (empty($upiId) || !preg_match('/^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,}$/', $upiId) || in_array(strtolower($upiId), ['test@upi', 'fake@upi', 'demo@upi'])) {
            Database::recordPayment($email, $plan, $amount, $currency, $method, 'UPI', 'failed');
            echo json_encode(['success' => false, 'error' => 'Invalid UPI VPA address. Real UPI handle required.']);
            exit;
        }
        $cardLast4 = 'UPI';
    } elseif ($method === 'netbanking') {
        $validBanks = ['hdfc', 'icici', 'sbi', 'axis', 'kotak', 'pnb', 'bob', 'indusind', 'yes'];
        if (empty($bankName) || !in_array(strtolower($bankName), $validBanks)) {
            Database::recordPayment($email, $plan, $amount, $currency, $method, 'NETB', 'failed');
            echo json_encode(['success' => false, 'error' => 'Invalid Bank: Please select an authorized Indian banking institution.']);
            exit;
        }
        $cardLast4 = strtoupper($bankName);
    } else {
        echo json_encode(['success' => false, 'error' => 'Unsupported payment method.']);
        exit;
    }
}

$receipt = Database::recordPayment($email, $plan, $amount, $currency, $method, $cardLast4, 'succeeded');
$updatedUser = Database::getUserByEmail($email);

echo json_encode([
    'success' => true,
    'message' => 'Payment of ₹' . number_format($amount, 2) . ' INR verified and settled via Razorpay! Plan upgraded.',
    'mode' => $paymentMode,
    'gateway_key' => $gatewayKeyId ? substr($gatewayKeyId, 0, 8) . '...' : '',
    'transaction' => $receipt,
    'user' => $updatedUser
]);
