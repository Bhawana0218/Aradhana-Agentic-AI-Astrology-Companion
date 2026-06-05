import logging

from langgraph.graph import END, StateGraph
from langgraph.prebuilt import ToolNode

from .nodes import reasoner_node, respond_node, router_node
from .state import AgentState
from .tools import (
    compute_birth_chart,
    geocode_place,
    get_daily_transits,
    knowledge_lookup,
)

logger = logging.getLogger(__name__)


def should_continue(state: AgentState) -> str:
    messages = state.get("messages", [])
    step_count = state.get("step_count", 0)
    if not messages:
        return "respond"
    last_msg = messages[-1]
    has_tool_calls = hasattr(last_msg, "tool_calls") and bool(last_msg.tool_calls)
    if has_tool_calls and step_count < 8:
        return "tools"
    return "respond"


def build_graph():
    tools = [geocode_place, compute_birth_chart, get_daily_transits, knowledge_lookup]
    tool_node = ToolNode(tools)

    graph = StateGraph(AgentState)
    graph.add_node("router", router_node)
    graph.add_node("reasoner", reasoner_node)
    graph.add_node("tools", tool_node)
    graph.add_node("respond", respond_node)

    graph.set_entry_point("router")
    graph.add_edge("router", "reasoner")

    graph.add_conditional_edges(
        "reasoner",
        should_continue,
        {"tools": "tools", "respond": "respond", END: END},
    )
    graph.add_edge("tools", "reasoner")
    graph.add_edge("respond", END)

    return graph.compile()


agent_graph = build_graph()
