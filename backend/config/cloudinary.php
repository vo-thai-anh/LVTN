<?php

/*
 * This file is part of the Laravel Cloudinary package.
 */

// Parse CLOUDINARY_URL if exists
$cloudinaryUrl = env('CLOUDINARY_URL');
$cloud = $apiKey = $apiSecret = null;

if ($cloudinaryUrl && preg_match('/cloudinary:\/\/([^:]+):([^@]+)@(.+)/', $cloudinaryUrl, $matches)) {
    $apiKey = $matches[1];
    $apiSecret = $matches[2];
    $cloud = $matches[3];
}

return [
    'notification_url' => env('CLOUDINARY_NOTIFICATION_URL'),
    'cloud_url' => env('CLOUDINARY_URL'),
    'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET'),
    'upload_route' => env('CLOUDINARY_UPLOAD_ROUTE'),
    'upload_action' => env('CLOUDINARY_UPLOAD_ACTION'),
    
    // Parsed credentials
    'api_key' => $apiKey,
    'api_secret' => $apiSecret,
    'cloud_name' => $cloud,
];
