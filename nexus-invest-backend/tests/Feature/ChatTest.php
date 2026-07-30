<?php

namespace Tests\Feature;

use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChatTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;
    private ChatRoom $generalRoom;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test')->plainTextToken;

        $this->generalRoom = ChatRoom::create([
            'type' => 'general',
            'name' => 'Général',
            'is_active' => true,
        ]);
    }

    public function test_chat_rooms_returns_200(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/chat/rooms');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_general_room_appears_in_rooms(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/chat/rooms');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('general', $response->json('data.0.type'));
    }

    public function test_chat_rooms_structure(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/chat/rooms');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id',
                    'type',
                    'name',
                    'last_message',
                    'unread_count',
                ],
            ],
        ]);
    }

    public function test_chat_messages_returns_200(): void
    {
        ChatMessage::create([
            'chat_room_id' => $this->generalRoom->id,
            'user_id' => $this->user->id,
            'message' => 'Hello world',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/chat/rooms/' . $this->generalRoom->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_chat_messages_paginated(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/chat/rooms/' . $this->generalRoom->id);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'current_page',
                'data',
                'per_page',
                'total',
            ],
        ]);
    }

    public function test_chat_messages_room_not_found(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/chat/rooms/9999');

        $response->assertStatus(404);
    }

    public function test_send_message_success(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/chat/rooms/' . $this->generalRoom->id, [
                'message' => 'Bonjour tout le monde',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_send_message_too_short(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/chat/rooms/' . $this->generalRoom->id, [
                'message' => '',
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_send_message_too_long(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/chat/rooms/' . $this->generalRoom->id, [
                'message' => str_repeat('a', 2001),
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_send_message_room_not_found(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/chat/rooms/9999', [
                'message' => 'Hello',
            ]);

        $response->assertStatus(404);
    }
}
