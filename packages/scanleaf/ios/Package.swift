// swift-tools-version:5.9

import PackageDescription

let package = Package(
  name: "sageleaf-scanleaf",
  platforms: [
    .macOS(.v10_13),
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
  ],
  targets: [
    .target(
      name: "sageleaf-scanleaf",
      dependencies: [
        .byName(name: "Tauri"),
      ],
      path: "Sources/SageleafScanleaf")
  ]
)
