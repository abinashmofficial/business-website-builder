<?php
class Database {
    private static $dataDir = __DIR__ . '/data';

    private static function getFilePath($table) {
        return self::$dataDir . '/' . $table . '.json';
    }

    private static function readTable($table) {
        $path = self::getFilePath($table);
        if (!file_exists($path)) {
            return [];
        }
        $fp = @fopen($path, 'r');
        if (!$fp) {
            return [];
        }
        flock($fp, LOCK_SH);
        $contents = stream_get_contents($fp);
        flock($fp, LOCK_UN);
        fclose($fp);
        $data = json_decode($contents, true);
        return is_array($data) ? $data : [];
    }

    private static function writeTable($table, $data) {
        if (!is_dir(self::$dataDir)) {
            @mkdir(self::$dataDir, 0775, true);
        }
        $path = self::getFilePath($table);
        $fp = fopen($path, 'c+');
        if (!$fp) {
            return false;
        }
        flock($fp, LOCK_EX);
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);
        return true;
    }

    public static function getUserByEmail($email) {
        $cleanEmail = strtolower(trim($email));
        $users = self::readTable('users');
        foreach ($users as $user) {
            if (isset($user['email']) && strtolower($user['email']) === $cleanEmail) {
                return $user;
            }
        }
        return null;
    }

    public static function createUserOrGet($email, $name = '') {
        $cleanEmail = strtolower(trim($email));
        $user = self::getUserByEmail($cleanEmail);
        if ($user) {
            return $user;
        }
        $users = self::readTable('users');
        $cleanName = !empty($name) ? $name : explode('@', $cleanEmail)[0];
        $newUser = [
            'id' => 'usr_' . bin2hex(random_bytes(8)),
            'email' => $cleanEmail,
            'name' => ucfirst($cleanName),
            'avatar' => '',
            'plan' => 'free',
            'planName' => 'Free Edition (Limited)',
            'role' => 'user',
            'isAuthorized' => true,
            'createdAt' => date('c'),
            'updatedAt' => date('c')
        ];
        $users[] = $newUser;
        self::writeTable('users', $users);
        return $newUser;
    }

    public static function updateUserPlan($email, $plan) {
        $cleanEmail = strtolower(trim($email));
        $users = self::readTable('users');
        $updatedUser = null;
        $planNames = [
            'free' => 'Free Edition (Limited)',
            'pro' => 'Pro Edition',
            'enterprise' => 'Enterprise Edition'
        ];
        $planName = isset($planNames[$plan]) ? $planNames[$plan] : 'Free Edition (Limited)';

        foreach ($users as &$user) {
            if (isset($user['email']) && strtolower($user['email']) === $cleanEmail) {
                $user['plan'] = $plan;
                $user['planName'] = $planName;
                $user['updatedAt'] = date('c');
                $updatedUser = $user;
                break;
            }
        }
        unset($user);

        if (!$updatedUser) {
            $updatedUser = self::createUserOrGet($cleanEmail);
            return self::updateUserPlan($cleanEmail, $plan);
        }

        self::writeTable('users', $users);
        return $updatedUser;
    }

    public static function saveOtp($email, $otp) {
        $cleanEmail = strtolower(trim($email));
        $otps = self::readTable('otps');
        $now = time();
        $filtered = [];
        foreach ($otps as $item) {
            if (isset($item['expires_at']) && $item['expires_at'] > $now && strtolower($item['email']) !== $cleanEmail) {
                $filtered[] = $item;
            }
        }
        $filtered[] = [
            'email' => $cleanEmail,
            'otp' => password_hash($otp, PASSWORD_BCRYPT),
            'raw_code' => $otp,
            'expires_at' => $now + 600,
            'created_at' => date('c'),
            'attempts' => 0
        ];
        self::writeTable('otps', $filtered);
        return true;
    }

    public static function verifyOtp($email, $inputOtp) {
        $cleanEmail = strtolower(trim($email));
        $cleanCode = trim($inputOtp);
        $otps = self::readTable('otps');
        $now = time();
        $matchIndex = -1;

        foreach ($otps as $idx => $item) {
            if (isset($item['email']) && strtolower($item['email']) === $cleanEmail) {
                if (isset($item['expires_at']) && $item['expires_at'] >= $now) {
                    if (password_verify($cleanCode, $item['otp']) || (isset($item['raw_code']) && $item['raw_code'] === $cleanCode)) {
                        $matchIndex = $idx;
                        break;
                    }
                }
            }
        }

        if ($matchIndex >= 0) {
            array_splice($otps, $matchIndex, 1);
            self::writeTable('otps', $otps);
            return true;
        }

        return false;
    }

    public static function recordPayment($email, $plan, $amount, $currency, $method, $cardLast4 = '', $status = 'succeeded') {
        $cleanEmail = strtolower(trim($email));
        $payments = self::readTable('payments');
        $txId = 'tx_' . strtoupper(bin2hex(random_bytes(6)));
        $receiptNo = 'REC-' . date('Ymd') . '-' . rand(1000, 9999);

        $newPayment = [
            'transaction_id' => $txId,
            'receipt_number' => $receiptNo,
            'email' => $cleanEmail,
            'plan' => $plan,
            'amount' => (float)$amount,
            'currency' => strtoupper($currency),
            'method' => $method,
            'card_last4' => $cardLast4,
            'status' => $status,
            'payment_date' => date('c'),
            'ip_address' => isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1'
        ];

        $payments[] = $newPayment;
        self::writeTable('payments', $payments);

        if ($status === 'succeeded') {
            self::updateUserPlan($cleanEmail, $plan);
        }

        return $newPayment;
    }

    public static function getTransactionsByEmail($email) {
        $cleanEmail = strtolower(trim($email));
        $payments = self::readTable('payments');
        $userPayments = [];
        foreach ($payments as $p) {
            if (isset($p['email']) && strtolower($p['email']) === $cleanEmail) {
                $userPayments[] = $p;
            }
        }
        return $userPayments;
    }
}
