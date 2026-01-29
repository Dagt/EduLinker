from urllib.parse import parse_qs

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken, TokenError

from core.models import Group, User
from core.permissions import can_view_chat


class GroupChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.group_id = self.scope["url_route"]["kwargs"]["group_id"]
        user = await self._get_authenticated_user()
        if not user:
            await self.close()
            return
        group = await self._get_group()
        if not group:
            await self.close()
            return
        allowed = await sync_to_async(can_view_chat)(user, group)
        if not allowed:
            await self.close()
            return
        self.scope["user"] = user
        self.room_group_name = f"group_chat_{self.group_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        room_group_name = getattr(self, "room_group_name", None)
        if room_group_name:
            await self.channel_layer.group_discard(room_group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        # Messages are sent via REST and broadcast server-side.
        return

    async def chat_message(self, event):
        await self.send_json(event["payload"])

    async def _get_authenticated_user(self):
        user = self.scope.get("user")
        if user and user.is_authenticated:
            return user
        query_string = self.scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token = params.get("token", [None])[0]
        if not token:
            return None
        try:
            access = AccessToken(token)
        except TokenError:
            return None
        user_id = access.get("user_id")
        if not user_id:
            return None
        return await sync_to_async(User.objects.filter(id=user_id, is_active=True).first)()

    async def _get_group(self):
        return await sync_to_async(Group.objects.filter(id=self.group_id).first)()
