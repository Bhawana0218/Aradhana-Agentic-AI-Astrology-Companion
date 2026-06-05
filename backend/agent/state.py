from typing import Annotated, TypedDict

from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage


class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    birth_details: dict | None
    natal_chart: dict | None
    intent: str | None
    tool_outputs: list[dict]
    session_id: str
    step_count: int
