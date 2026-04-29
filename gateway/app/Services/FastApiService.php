<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Response;

class FastApiService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.fastapi.url', env('FASTAPI_URL', 'http://localhost:8000'));
        $this->apiKey = config('services.fastapi.key', env('FASTAPI_INTERNAL_KEY', ''));
    }

    /**
     * Send GET request to FastAPI backend.
     */
    public function get(string $path, array $query = []): array
    {
        $response = Http::timeout(30)
            ->withHeaders($this->headers())
            ->get("{$this->baseUrl}{$path}", $query);

        return $this->parseResponse($response);
    }

    /**
     * Send POST request to FastAPI backend.
     */
    public function post(string $path, array $data = []): array
    {
        $response = Http::timeout(30)
            ->withHeaders($this->headers())
            ->post("{$this->baseUrl}{$path}", $data);

        return $this->parseResponse($response);
    }

    /**
     * Internal headers for backend communication.
     */
    protected function headers(): array
    {
        return [
            'X-Internal-Key' => $this->apiKey,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ];
    }

    /**
     * Parse HTTP response into standard format.
     */
    protected function parseResponse(Response $response): array
    {
        return [
            'status' => $response->status(),
            'data' => $response->json() ?? [],
            'success' => $response->successful(),
        ];
    }
}
