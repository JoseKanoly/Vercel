<?php

$host = $_ENV['NEON_HOST'] ?? 'withered-math-aew2ropa-pooler.c-2.us-east-2.aws.neon.tech';
$dbname = $_ENV['NEON_DATABASE'] ?? 'neondb';
$username = $_ENV['NEON_USERNAME'] ?? 'neondb_owner';
$password = $_ENV['NEON_PASSWORD'] ?? 'npg_RgB8nXoQdN4f0ep';

try {
    // Crear conexión PDO con SSL
    $dsn = "pgsql:host=$host;dbname=$dbname;sslmode=require";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    echo "✅ Conexión exitosa a Neon Database\n";

} catch (PDOException $e) {
    die("❌ Error de conexión: " . $e->getMessage() . "\n");
}

/**
 * Función para registrar usuario (Formulario 5)
 */
function registerUser($pdo, $userData) {
    try {
        // Validaciones según especificaciones
        if (empty($userData['name']) || strlen($userData['name']) < 3) {
            throw new Exception("Nombre debe tener al menos 3 caracteres");
        }
        
        if (!filter_var($userData['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Email inválido");
        }
        
        if (strlen($userData['password']) < 8) {
            throw new Exception("Contraseña debe tener al menos 8 caracteres");
        }
        
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/', $userData['password'])) {
            throw new Exception("Contraseña debe incluir mayúsculas, minúsculas y números");
        }

        // Verificar si el email ya existe
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$userData['email']]);
        if ($stmt->fetch()) {
            throw new Exception("Email ya existe");
        }

        // Hash de la contraseña
        $passwordHash = password_hash($userData['password'], PASSWORD_DEFAULT);

        // Insertar usuario
        $stmt = $pdo->prepare("
            INSERT INTO users (name, email, institution, role, password_hash) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $userData['name'],
            $userData['email'],
            $userData['institution'],
            $userData['role'],
            $passwordHash
        ]);

        return [
            'success' => true,
            'message' => 'Usuario registrado exitosamente',
            'user_id' => $pdo->lastInsertId()
        ];

    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

/**
 * Función para configurar alertas (Formulario 3)
 */
function configureAlert($pdo, $alertData) {
    try {
        // Validaciones según especificaciones
        $validParameters = ['ph', 'oxygen', 'temperature', 'salinity', 'turbidity'];
        if (!in_array($alertData['parameter_type'], $validParameters)) {
            throw new Exception("Parámetro no válido");
        }

        if (!filter_var($alertData['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Email inválido");
        }

        $minThreshold = floatval($alertData['min_threshold']);
        $maxThreshold = floatval($alertData['max_threshold']);
        
        if ($minThreshold >= $maxThreshold) {
            throw new Exception("Umbral mínimo debe ser menor que el máximo");
        }

        // Validar rangos según parámetro
        switch ($alertData['parameter_type']) {
            case 'ph':
                if ($minThreshold < 0 || $maxThreshold > 14) {
                    throw new Exception("pH debe estar entre 0 y 14");
                }
                break;
            case 'oxygen':
                if ($minThreshold < 0 || $maxThreshold > 20) {
                    throw new Exception("Oxígeno debe estar entre 0 y 20 mg/L");
                }
                break;
            case 'temperature':
                if ($minThreshold < -10 || $maxThreshold > 50) {
                    throw new Exception("Temperatura debe estar entre -10 y 50°C");
                }
                break;
        }

        // Insertar configuración de alerta
        $stmt = $pdo->prepare("
            INSERT INTO alert_configurations 
            (user_id, parameter_type, min_threshold, max_threshold, email_notifications, frequency_minutes) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $alertData['user_id'],
            $alertData['parameter_type'],
            $minThreshold,
            $maxThreshold,
            $alertData['email_notifications'] ? 1 : 0,
            intval($alertData['frequency'])
        ]);

        return [
            'success' => true,
            'message' => 'Configuración de alerta guardada exitosamente',
            'alert_id' => $pdo->lastInsertId()
        ];

    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

/**
 * Función para exportar datos (Formulario 4)
 */
function exportData($pdo, $exportParams) {
    try {
        // Validaciones según especificaciones
        $validFormats = ['CSV', 'JSON', 'PDF'];
        if (!in_array($exportParams['format'], $validFormats)) {
            throw new Exception("Formato no soportado");
        }

        if (empty($exportParams['date_start']) || empty($exportParams['date_end'])) {
            throw new Exception("Fechas requeridas");
        }

        if (empty($exportParams['stations']) || empty($exportParams['parameters'])) {
            throw new Exception("Debe seleccionar estaciones y parámetros");
        }

        $dateStart = new DateTime($exportParams['date_start']);
        $dateEnd = new DateTime($exportParams['date_end']);
        
        if ($dateStart >= $dateEnd) {
            throw new Exception("Fecha inicio debe ser anterior a fecha fin");
        }

        // Construir consulta dinámica
        $stationIds = implode(',', array_map('intval', $exportParams['stations']));
        $parameterColumns = [];
        
        foreach ($exportParams['parameters'] as $param) {
            switch (strtolower($param)) {
                case 'ph':
                    $parameterColumns[] = 'ph';
                    break;
                case 'oxígeno':
                    $parameterColumns[] = 'oxygen';
                    break;
                case 'temperatura':
                    $parameterColumns[] = 'temperature';
                    break;
                case 'salinidad':
                    $parameterColumns[] = 'salinity';
                    break;
                case 'turbidez':
                    $parameterColumns[] = 'turbidity';
                    break;
            }
        }

        $columns = implode(', ', $parameterColumns);
        
        $query = "
            SELECT 
                ms.name as station_name,
                ms.latitude,
                ms.longitude,
                $columns,
                ep.recorded_at
            FROM environmental_parameters ep
            JOIN monitoring_stations ms ON ep.station_id = ms.id
            WHERE ep.station_id IN ($stationIds)
            AND ep.recorded_at BETWEEN ? AND ?
            ORDER BY ep.recorded_at DESC
        ";

        $stmt = $pdo->prepare($query);
        $stmt->execute([$exportParams['date_start'], $exportParams['date_end']]);
        $data = $stmt->fetchAll();

        // Registrar exportación
        $exportStmt = $pdo->prepare("
            INSERT INTO data_exports 
            (user_id, export_format, date_range_start, date_range_end, stations_included, parameters_included, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'completed')
        ");
        
        $exportStmt->execute([
            $exportParams['user_id'],
            $exportParams['format'],
            $exportParams['date_start'],
            $exportParams['date_end'],
            json_encode($exportParams['stations']),
            json_encode($exportParams['parameters'])
        ]);

        return [
            'success' => true,
            'message' => 'Datos exportados exitosamente',
            'data' => $data,
            'export_id' => $pdo->lastInsertId()
        ];

    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

/**
 * Función para filtrar estaciones (Formulario 2)
 */
function filterStations($pdo, $filters) {
    try {
        $query = "
            SELECT 
                ms.*,
                ep.ph,
                ep.oxygen,
                ep.temperature,
                ep.salinity,
                ep.turbidity,
                ep.recorded_at,
                COUNT(a.id) as alert_count
            FROM monitoring_stations ms
            LEFT JOIN environmental_parameters ep ON ms.id = ep.station_id
            LEFT JOIN alerts a ON ms.id = a.station_id AND a.is_resolved = false
        ";

        $conditions = [];
        $params = [];

        // Filtro por estado
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $conditions[] = "ms.status = ?";
            $params[] = $filters['status'];
        }

        // Filtro por coordenadas (rango)
        if (!empty($filters['lat_min']) && !empty($filters['lat_max'])) {
            $conditions[] = "ms.latitude BETWEEN ? AND ?";
            $params[] = floatval($filters['lat_min']);
            $params[] = floatval($filters['lat_max']);
        }

        if (!empty($filters['lng_min']) && !empty($filters['lng_max'])) {
            $conditions[] = "ms.longitude BETWEEN ? AND ?";
            $params[] = floatval($filters['lng_min']);
            $params[] = floatval($filters['lng_max']);
        }

        // Filtro por fecha
        if (!empty($filters['date_start']) && !empty($filters['date_end'])) {
            $conditions[] = "ep.recorded_at BETWEEN ? AND ?";
            $params[] = $filters['date_start'];
            $params[] = $filters['date_end'];
        }

        if (!empty($conditions)) {
            $query .= " WHERE " . implode(" AND ", $conditions);
        }

        $query .= " GROUP BY ms.id, ep.ph, ep.oxygen, ep.temperature, ep.salinity, ep.turbidity, ep.recorded_at";
        $query .= " ORDER BY ms.name";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $stations = $stmt->fetchAll();

        return [
            'success' => true,
            'data' => $stations,
            'count' => count($stations)
        ];

    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

/**
 * Función para búsqueda global (Formulario 1)
 */
function globalSearch($pdo, $searchQuery) {
    try {
        // Validación según especificaciones
        if (strlen($searchQuery) < 3) {
            throw new Exception("Mínimo 3 caracteres");
        }

        if (!preg_match('/^[a-zA-Z0-9\s\-_.]+$/', $searchQuery)) {
            throw new Exception("Caracteres no válidos");
        }

        $searchTerm = "%$searchQuery%";
        $results = [];

        // Buscar en estaciones
        $stationStmt = $pdo->prepare("
            SELECT 'station' as type, id, name as title, 
                   CONCAT('Lat: ', latitude, ', Lng: ', longitude) as description
            FROM monitoring_stations 
            WHERE name ILIKE ? OR CAST(id as TEXT) ILIKE ?
            LIMIT 5
        ");
        $stationStmt->execute([$searchTerm, $searchTerm]);
        $results['stations'] = $stationStmt->fetchAll();

        // Buscar en alertas
        $alertStmt = $pdo->prepare("
            SELECT 'alert' as type, id, message as title, 
                   CONCAT('Nivel: ', alert_level, ' - ', created_at) as description
            FROM alerts 
            WHERE message ILIKE ? AND is_resolved = false
            LIMIT 5
        ");
        $alertStmt->execute([$searchTerm]);
        $results['alerts'] = $alertStmt->fetchAll();

        // Buscar parámetros por rango
        if (is_numeric($searchQuery)) {
            $numericValue = floatval($searchQuery);
            $paramStmt = $pdo->prepare("
                SELECT 'parameter' as type, ep.id, 
                       CONCAT(ms.name, ' - ', 
                              CASE 
                                WHEN ph BETWEEN ? - 0.5 AND ? + 0.5 THEN 'pH: ' || ph
                                WHEN oxygen BETWEEN ? - 1 AND ? + 1 THEN 'Oxígeno: ' || oxygen || ' mg/L'
                                WHEN temperature BETWEEN ? - 2 AND ? + 2 THEN 'Temperatura: ' || temperature || '°C'
                              END) as title,
                       recorded_at as description
                FROM environmental_parameters ep
                JOIN monitoring_stations ms ON ep.station_id = ms.id
                WHERE (ph BETWEEN ? - 0.5 AND ? + 0.5)
                   OR (oxygen BETWEEN ? - 1 AND ? + 1)
                   OR (temperature BETWEEN ? - 2 AND ? + 2)
                ORDER BY recorded_at DESC
                LIMIT 5
            ");
            $paramStmt->execute(array_fill(0, 12, $numericValue));
            $results['parameters'] = $paramStmt->fetchAll();
        }

        return [
            'success' => true,
            'data' => $results,
            'query' => $searchQuery,
            'total_results' => array_sum(array_map('count', $results))
        ];

    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

// Ejemplo de uso
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    switch ($action) {
        case 'register_user':
            $result = registerUser($pdo, $_POST);
            break;
            
        case 'configure_alert':
            $result = configureAlert($pdo, $_POST);
            break;
            
        case 'export_data':
            $result = exportData($pdo, $_POST);
            break;
            
        case 'filter_stations':
            $result = filterStations($pdo, $_POST);
            break;
            
        case 'global_search':
            $result = globalSearch($pdo, $_POST['query'] ?? '');
            break;
            
        default:
            $result = ['success' => false, 'message' => 'Acción no válida'];
    }
    
    header('Content-Type: application/json');
    echo json_encode($result);
}
?>
