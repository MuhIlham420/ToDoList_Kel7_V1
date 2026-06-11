<?php

$databasePath = __DIR__ . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'database.sqlite';

try {
    if (! is_dir(dirname($databasePath))) {
        mkdir(dirname($databasePath), 0775, true);
    }

    if (! file_exists($databasePath)) {
        touch($databasePath);
    }

    $pdo = new PDO('sqlite:' . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('PRAGMA foreign_keys = ON;');

    $version = $pdo->query('select sqlite_version()')->fetchColumn();

    echo "SUCCESS: SQLite database ready at {$databasePath}\n";
    echo "SQLite version: {$version}\n";
} catch (PDOException $e) {
    echo 'ERROR: ' . $e->getMessage() . "\n";
}
