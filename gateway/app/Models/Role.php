<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'permissions',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    /**
     * Available roles:
     * - admin:         Full access
     * - auditor:       View all data, manage alerts, generate reports
     * - field_officer: View assigned provinces, update alert status
     */
    public const ADMIN = 'admin';
    public const AUDITOR = 'auditor';
    public const FIELD_OFFICER = 'field_officer';

    public static function defaultPermissions(): array
    {
        return [
            self::ADMIN => ['*'],
            self::AUDITOR => [
                'anomaly.view', 'anomaly.detect',
                'prices.view', 'prices.predict',
                'chain.view',
                'alerts.view', 'alerts.manage',
                'reports.view', 'reports.generate',
                'insights.view', 'insights.generate',
            ],
            self::FIELD_OFFICER => [
                'anomaly.view',
                'prices.view',
                'chain.view',
                'alerts.view', 'alerts.update_status',
                'reports.view',
                'insights.view',
            ],
        ];
    }
}
