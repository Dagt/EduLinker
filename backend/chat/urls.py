from django.urls import path
from .views import ChatMessageListCreateView

urlpatterns = [
    path("chats/<int:group_id>/messages/", ChatMessageListCreateView.as_view(), name="chat-messages"),
]
