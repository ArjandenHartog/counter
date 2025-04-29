#!/bin/bash

# Script to create a static export for regular web hosting (without Node.js)

# Exit on any error
set -e

echo "Building static export for regular web hosting..."
npm run build

echo "Creating static site package..."
# Copy database to out directory
mkdir -p out/db
cp -r db/*.db out/db/

# Create PHP API proxy - eerst alle directories aanmaken
mkdir -p out/api
mkdir -p out/api/teams

# Create PHP file for fetching counter
cat > out/api/count.php << 'EOF'
<?php
header('Content-Type: application/json');
$dbPath = '../db/counter.db';

try {
    $db = new SQLite3($dbPath);
    $result = $db->query('SELECT COALESCE(count, 0) as count FROM counter WHERE id = 1');
    $row = $result->fetchArray(SQLITE3_ASSOC);
    $count = $row ? intval($row['count']) : 0;
    echo json_encode(['count' => $count]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
EOF

# Create PHP file for incrementing counter
cat > out/api/increment.php << 'EOF'
<?php
header('Content-Type: application/json');
$dbPath = '../db/counter.db';

try {
    $db = new SQLite3($dbPath);
    $db->exec('BEGIN');
    
    $db->exec('UPDATE counter SET count = count + 1 WHERE id = 1');
    
    // Get updated count
    $result = $db->query('SELECT COALESCE(count, 0) as count FROM counter WHERE id = 1');
    $row = $result->fetchArray(SQLITE3_ASSOC);
    $count = $row ? intval($row['count']) : 0;
    
    // Log the increment
    $stmt = $db->prepare('INSERT INTO logs (action, new_value, note) VALUES (?, ?, ?)');
    $stmt->bindValue(1, 'increment', SQLITE3_TEXT);
    $stmt->bindValue(2, $count, SQLITE3_INTEGER);
    $stmt->bindValue(3, 'Counter verhoogd', SQLITE3_TEXT);
    $stmt->execute();
    
    $db->exec('COMMIT');
    echo json_encode(['count' => $count]);
} catch (Exception $e) {
    if ($db) $db->exec('ROLLBACK');
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
EOF

# Create PHP file for decrementing counter
cat > out/api/decrement.php << 'EOF'
<?php
header('Content-Type: application/json');
$dbPath = '../db/counter.db';

try {
    $db = new SQLite3($dbPath);
    $db->exec('BEGIN');
    
    // Only decrement if count > 0
    $result = $db->query('SELECT COALESCE(count, 0) as count FROM counter WHERE id = 1');
    $row = $result->fetchArray(SQLITE3_ASSOC);
    $currentCount = $row ? intval($row['count']) : 0;
    
    if ($currentCount > 0) {
        $db->exec('UPDATE counter SET count = count - 1 WHERE id = 1');
        
        // Get updated count
        $result = $db->query('SELECT COALESCE(count, 0) as count FROM counter WHERE id = 1');
        $row = $result->fetchArray(SQLITE3_ASSOC);
        $count = $row ? intval($row['count']) : 0;
        
        // Log the decrement
        $stmt = $db->prepare('INSERT INTO logs (action, new_value, note) VALUES (?, ?, ?)');
        $stmt->bindValue(1, 'decrement', SQLITE3_TEXT);
        $stmt->bindValue(2, $count, SQLITE3_INTEGER);
        $stmt->bindValue(3, 'Counter verlaagd', SQLITE3_TEXT);
        $stmt->execute();
    } else {
        $count = 0;
    }
    
    $db->exec('COMMIT');
    echo json_encode(['count' => $count]);
} catch (Exception $e) {
    if ($db) $db->exec('ROLLBACK');
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
EOF

# Create PHP file for resetting counter
cat > out/api/reset.php << 'EOF'
<?php
header('Content-Type: application/json');
$dbPath = '../db/counter.db';

try {
    $db = new SQLite3($dbPath);
    $db->exec('BEGIN');
    
    $db->exec('UPDATE counter SET count = 0 WHERE id = 1');
    
    // Log the reset
    $stmt = $db->prepare('INSERT INTO logs (action, new_value, note) VALUES (?, ?, ?)');
    $stmt->bindValue(1, 'reset', SQLITE3_TEXT);
    $stmt->bindValue(2, 0, SQLITE3_INTEGER);
    $stmt->bindValue(3, 'Counter reset', SQLITE3_TEXT);
    $stmt->execute();
    
    $db->exec('COMMIT');
    echo json_encode(['count' => 0]);
} catch (Exception $e) {
    if ($db) $db->exec('ROLLBACK');
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
EOF

# Create PHP file for teams
cat > out/api/teams.php << 'EOF'
<?php
header('Content-Type: application/json');
$dbPath = '../db/counter.db';

try {
    $db = new SQLite3($dbPath);
    
    // Check if teams table exists
    $tableExists = $db->querySingle("SELECT name FROM sqlite_master WHERE type='table' AND name='teams'");
    
    if (!$tableExists) {
        // Create teams table if it doesn't exist
        $db->exec('
          CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY,
            count INTEGER NOT NULL DEFAULT 0
          )
        ');
        
        // Initialize with 0 teams
        $db->exec('INSERT INTO teams (id, count) VALUES (1, 0)');
        $count = 0;
    } else {
        // Get team count
        $result = $db->query('SELECT COALESCE(count, 0) as count FROM teams WHERE id = 1');
        $row = $result->fetchArray(SQLITE3_ASSOC);
        $count = $row ? intval($row['count']) : 0;
    }
    
    echo json_encode(['count' => $count]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
EOF

# Create PHP file for increment teams
cat > out/api/teams/increment.php << 'EOF'
<?php
header('Content-Type: application/json');
$dbPath = '../../db/counter.db';

try {
    $db = new SQLite3($dbPath);
    $db->exec('BEGIN');
    
    // Check if teams table exists
    $tableExists = $db->querySingle("SELECT name FROM sqlite_master WHERE type='table' AND name='teams'");
    
    if (!$tableExists) {
        // Create teams table if it doesn't exist
        $db->exec('
          CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY,
            count INTEGER NOT NULL DEFAULT 0
          )
        ');
        
        // Initialize with 0 teams
        $db->exec('INSERT INTO teams (id, count) VALUES (1, 0)');
    }
    
    // Increment counter
    $db->exec('UPDATE teams SET count = count + 1 WHERE id = 1');
    
    // Get updated count
    $result = $db->query('SELECT COALESCE(count, 0) as count FROM teams WHERE id = 1');
    $row = $result->fetchArray(SQLITE3_ASSOC);
    $count = $row ? intval($row['count']) : 0;
    
    // Log the increment
    $stmt = $db->prepare('INSERT INTO logs (action, new_value, note) VALUES (?, ?, ?)');
    $stmt->bindValue(1, 'team_added', SQLITE3_TEXT);
    $stmt->bindValue(2, $count, SQLITE3_INTEGER);
    $stmt->bindValue(3, 'Team aanmelding', SQLITE3_TEXT);
    $stmt->execute();
    
    $db->exec('COMMIT');
    echo json_encode(['count' => $count]);
} catch (Exception $e) {
    if ($db) $db->exec('ROLLBACK');
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
EOF

# Create directory for teams decrement
mkdir -p out/api/teams
cat > out/api/teams/decrement.php << 'EOF'
<?php
header('Content-Type: application/json');
$dbPath = '../../db/counter.db';

try {
    $db = new SQLite3($dbPath);
    $db->exec('BEGIN');
    
    // Check if teams table exists
    $tableExists = $db->querySingle("SELECT name FROM sqlite_master WHERE type='table' AND name='teams'");
    
    if (!$tableExists) {
        // Create teams table if it doesn't exist
        $db->exec('
          CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY,
            count INTEGER NOT NULL DEFAULT 0
          )
        ');
        
        // Initialize with 0 teams
        $db->exec('INSERT INTO teams (id, count) VALUES (1, 0)');
        $count = 0;
    } else {
        // Check current count
        $result = $db->query('SELECT COALESCE(count, 0) as count FROM teams WHERE id = 1');
        $row = $result->fetchArray(SQLITE3_ASSOC);
        $currentCount = $row ? intval($row['count']) : 0;
        
        // Only decrement if count > 0
        if ($currentCount > 0) {
            $db->exec('UPDATE teams SET count = count - 1 WHERE id = 1');
            
            // Get updated count
            $result = $db->query('SELECT COALESCE(count, 0) as count FROM teams WHERE id = 1');
            $row = $result->fetchArray(SQLITE3_ASSOC);
            $count = $row ? intval($row['count']) : 0;
            
            // Log the decrement
            $stmt = $db->prepare('INSERT INTO logs (action, new_value, note) VALUES (?, ?, ?)');
            $stmt->bindValue(1, 'team_removed', SQLITE3_TEXT);
            $stmt->bindValue(2, $count, SQLITE3_INTEGER);
            $stmt->bindValue(3, 'Team afmelding', SQLITE3_TEXT);
            $stmt->execute();
        } else {
            $count = 0;
        }
    }
    
    $db->exec('COMMIT');
    echo json_encode(['count' => $count]);
} catch (Exception $e) {
    if ($db) $db->exec('ROLLBACK');
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
EOF

# Create PHP file for reset teams
cat > out/api/teams/reset.php << 'EOF'
<?php
header('Content-Type: application/json');
$dbPath = '../../db/counter.db';

try {
    $db = new SQLite3($dbPath);
    $db->exec('BEGIN');
    
    // Check if teams table exists
    $tableExists = $db->querySingle("SELECT name FROM sqlite_master WHERE type='table' AND name='teams'");
    
    if (!$tableExists) {
        // Create teams table if it doesn't exist
        $db->exec('
          CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY,
            count INTEGER NOT NULL DEFAULT 0
          )
        ');
        
        // Initialize with 0 teams
        $db->exec('INSERT INTO teams (id, count) VALUES (1, 0)');
    } else {
        // Reset counter to 0
        $db->exec('UPDATE teams SET count = 0 WHERE id = 1');
    }
    
    // Log the reset
    $stmt = $db->prepare('INSERT INTO logs (action, new_value, note) VALUES (?, ?, ?)');
    $stmt->bindValue(1, 'reset', SQLITE3_TEXT);
    $stmt->bindValue(2, 0, SQLITE3_INTEGER);
    $stmt->bindValue(3, 'Teams reset', SQLITE3_TEXT);
    $stmt->execute();
    
    $db->exec('COMMIT');
    echo json_encode(['count' => 0]);
} catch (Exception $e) {
    if ($db) $db->exec('ROLLBACK');
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
EOF

# Create PHP file for logs
cat > out/api/logs.php << 'EOF'
<?php
header('Content-Type: application/json');
$dbPath = '../db/counter.db';

try {
    $db = new SQLite3($dbPath);
    
    // Check if logs table exists
    $tableExists = $db->querySingle("SELECT name FROM sqlite_master WHERE type='table' AND name='logs'");
    
    if (!$tableExists) {
        // Create logs table if it doesn't exist
        $db->exec('
          CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            action TEXT NOT NULL,
            new_value INTEGER NOT NULL,
            note TEXT
          )
        ');
        echo json_encode(['logs' => []]);
    } else {
        // Get logs, most recent first
        $result = $db->query('SELECT id, timestamp, action, new_value, note FROM logs ORDER BY timestamp DESC LIMIT 100');
        $logs = [];
        
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $logs[] = $row;
        }
        
        echo json_encode(['logs' => $logs]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
EOF

# Create .htaccess file for API routing
cat > out/.htaccess << 'EOF'
# Enable rewriting
RewriteEngine On

# Set the base directory
RewriteBase /

# If the request is for a real file or directory, don't do anything
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Handle API routes
RewriteRule ^api/count$ api/count.php [L]
RewriteRule ^api/increment$ api/increment.php [L]
RewriteRule ^api/decrement$ api/decrement.php [L]
RewriteRule ^api/reset$ api/reset.php [L]
RewriteRule ^api/logs$ api/logs.php [L]
RewriteRule ^api/teams$ api/teams.php [L]
RewriteRule ^api/teams/increment$ api/teams/increment.php [L]
RewriteRule ^api/teams/decrement$ api/teams/decrement.php [L]
RewriteRule ^api/teams/reset$ api/teams/reset.php [L]

# Otherwise, serve index.html
RewriteRule ^ index.html [L]
EOF

# Create a PHP info.php file to check server configuration
cat > out/info.php << 'EOF'
<?php
phpinfo();
?>
EOF

# Create archive
TIMESTAMP=$(date +%Y%m%d%H%M%S)
ARCHIVE_NAME="counter-static-$TIMESTAMP.zip"

echo "Creating zip archive $ARCHIVE_NAME..."
cd out
zip -r ../$ARCHIVE_NAME .
cd ..

echo "Static site package created: $ARCHIVE_NAME"
echo ""
echo "----------------------------------------"
echo "Upload Instructions:"
echo "----------------------------------------"
echo "1. Upload the contents of the '$ARCHIVE_NAME' file to your web host's root directory"
echo "2. Make sure the 'db' directory is writable by the web server:"
echo "   chmod 755 db"
echo "   chmod 664 db/counter.db"
echo "3. Ensure your hosting supports PHP with SQLite3 extension"
echo "4. Point your domain to the directory where you uploaded the files"
echo "5. Access your site through your domain name"
echo "----------------------------------------" 