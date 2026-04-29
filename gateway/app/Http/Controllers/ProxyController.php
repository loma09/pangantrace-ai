<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\FastApiService;

class ProxyController extends Controller
{
    public function __construct(
        protected FastApiService $fastApi
    ) {}

    /**
     * Proxy GET request ke FastAPI backend.
     */
    public function get(Request $request, string $path): JsonResponse
    {
        $response = $this->fastApi->get(
            "/api/v1/{$path}",
            $request->query()
        );

        return response()->json(
            $response['data'],
            $response['status']
        );
    }

    /**
     * Proxy POST request ke FastAPI backend.
     */
    public function post(Request $request, string $path): JsonResponse
    {
        $response = $this->fastApi->post(
            "/api/v1/{$path}",
            $request->all()
        );

        return response()->json(
            $response['data'],
            $response['status']
        );
    }

    /**
     * Anomaly detection — proxy ke FastAPI.
     */
    public function detectAnomaly(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'commodity' => 'required|string',
            'province' => 'required|string',
            'days' => 'sometimes|integer|min:12|max:365',
            'sensitivity' => 'sometimes|integer|min:0|max:99',
        ]);

        return $this->post($request, 'anomaly/detect');
    }

    /**
     * Price prediction — proxy ke FastAPI.
     */
    public function predictPrice(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'commodity' => 'required|string',
            'province' => 'sometimes|string',
        ]);

        return $this->post($request, 'prices/predict');
    }

    /**
     * Generate AI insight — proxy ke FastAPI.
     */
    public function generateInsight(Request $request): JsonResponse
    {
        return $this->post($request, 'insights/generate');
    }
}
