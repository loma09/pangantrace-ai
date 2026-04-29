<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\User;

class UserController extends Controller
{
    /**
     * List all users (admin only).
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $users = User::with('organization')
            ->when($request->role, fn ($q, $role) => $q->where('role', $role))
            ->orderBy('name')
            ->paginate(20);

        return response()->json($users);
    }

    /**
     * Update user role.
     */
    public function updateRole(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'role' => 'required|string|in:admin,auditor,field_officer',
        ]);

        $user->update(['role' => $validated['role']]);

        return response()->json([
            'message' => "Role berhasil diubah ke {$validated['role']}",
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Deactivate user.
     */
    public function deactivate(User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $user->update(['is_active' => false]);
        $user->tokens()->delete();

        return response()->json(['message' => 'User dinonaktifkan']);
    }
}
