<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
$otp = isset($data['otp']) ? trim($data['otp']) : '';

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Invalid email address']);
    exit;
}

if (empty($otp)) {
    echo json_encode(['success' => false, 'error' => 'Please enter the 6-digit verification code']);
    exit;
}

$verified = Database::verifyOtp($email, $otp);

if (!$verified) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid verification code. Access denied.'
    ]);
    exit;
}

$user = Database::createUserOrGet($email);

echo json_encode([
    'success' => true,
    'message' => 'Google 2-Step Verification successful',
    'user' => $user
]);
