<?php
http_response_code(403);
header('Content-Type: application/json');
echo json_encode(['status' => 403, 'error' => 'Forbidden']);
exit;
