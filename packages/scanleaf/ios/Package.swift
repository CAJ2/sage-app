// swift-tools-version:5.9

import PackageDescription

let package = Package(
    name: "sageleaf-scanleaf",
    platforms: [
        .macOS(.v10_15),
        .iOS(.v15),
    ],
    products: [
        .library(
            name: "sageleaf-scanleaf",
            type: .static,
            targets: ["sageleaf-scanleaf"])
    ],
    dependencies: [
        .package(name: "Tauri", path: "../.tauri/tauri-api"),
        .package(
            url: "https://github.com/d-date/google-mlkit-swiftpm",
            exact: "9.0.0"),
    ],
    targets: [
        .target(
            name: "sageleaf-scanleaf",
            dependencies: [
                .byName(name: "Tauri"),
                .product(
                    name: "MLKitBarcodeScanning", package: "google-mlkit-swiftpm",
                    condition: .when(platforms: [.iOS])),
                .product(
                    name: "MLKitTextRecognition", package: "google-mlkit-swiftpm",
                    condition: .when(platforms: [.iOS])),
                .product(
                    name: "MLKitImageLabeling", package: "google-mlkit-swiftpm",
                    condition: .when(platforms: [.iOS])),
            ],
            path: "Sources/SageleafScanleaf")
    ]
)
