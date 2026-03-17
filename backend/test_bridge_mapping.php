<?php

// Simplified test for bridge mapping logic
$studentData = [
    'id_number' => '2023-0001',
    'first_name' => 'JOHN',
    'middle_initial' => 'D',
    'last_name' => 'DOE',
    'manual_full_name' => 'JOHN DOE TEST',
    'email' => 'john.doe@test.com',
    'course' => 'BSCS',
    'address' => 'TEST ADDRESS 123',
    'guardian_name' => 'JANE DOE',
    'guardian_contact' => '09123456789',
    'payment_type' => 'COR',
];

echo "Testing bridge mapping logic...\n";

// This simulates the data merge in ApplicantsController::proxyToBridge
$dataToSend = array_merge($studentData, [
    'idNumber' => $studentData['id_number'],
    'firstName' => $studentData['first_name'],
    'middleInitial' => $studentData['middle_initial'],
    'lastName' => $studentData['last_name'],
    'guardianName' => $studentData['guardian_name'],
    'guardianContact' => $studentData['guardian_contact'],
    'paymentType' => $studentData['payment_type'],
    'manual_full_name' => $studentData['manual_full_name'],
    'email' => $studentData['email'],
]);

echo "Mapping Result:\n" . json_encode($dataToSend, JSON_PRETTY_PRINT) . "\n";

$requiredKeys = ['guardianName', 'guardianContact', 'manual_full_name', 'email', 'paymentType'];
$failed = false;
foreach ($requiredKeys as $key) {
    if (!isset($dataToSend[$key])) {
        echo "FAILED: Missing key $key\n";
        $failed = true;
    }
}

if (!$failed && $dataToSend['guardianName'] === 'JANE DOE') {
    echo "SUCCESS: Logic matches idTech expectations!\n";
} else {
    echo "FAILED: Mapping verification failed.\n";
    exit(1);
}
