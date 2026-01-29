from typing import TypedDict, Optional
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


from langchain_community.chat_models import ChatOllama
from langgraph.graph import StateGraph


# -----------------------------
# 1. FastAPI setup
# -----------------------------
app = FastAPI()


# Allow your frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# 2. Local LLM (Ollama)
# -----------------------------
chat_model = ChatOllama(
    model="llama3",
    temperature=0.7,
)


# -----------------------------
# 3. Define LangGraph State
# -----------------------------
class FoodState(TypedDict, total=False):
    name: str
    quantity: float
    unit: str
    original_price: float
    category: str
    expiry_date: str
    business: str
    description: str
    predicted_price: Optional[float]
    market_trend: Optional[str]
    recommendation: Optional[str]
    explanation: Optional[str]


# Pydantic model for API input
class InventoryItem(BaseModel):
    name: str
    quantity: float
    unit: str
    originalPrice: float
    category: str
    expiryDate: str
    businessName: str
    description: Optional[str] = "N/A"


# -----------------------------
# 4. Graph Nodes
# -----------------------------
def predict_price(state: FoodState) -> FoodState:
    predicted_price = state.get("original_price", 0) * 1.1
    return {**state, "predicted_price": predicted_price}


def analyze_market(state: FoodState) -> FoodState:
    trend = "high" if state.get("predicted_price", 0) > 3 else "low"
    return {**state, "market_trend": trend}


def recommend_action(state: FoodState) -> FoodState:
    if state.get("market_trend") == "high":
        rec = "Sell now"
    else:
        rec = "Discount or donate"
    return {**state, "recommendation": rec}


def explain_recommendation(state: FoodState) -> FoodState:
    prompt = f"""
Item: {state.get('name')}
Quantity: {state.get('quantity')} {state.get('unit')}
Original Price: ${state.get('original_price')}
Category: {state.get('category')}
Expiry Date: {state.get('expiry_date')}
Business: {state.get('business')}
Description: {state.get('description')}


Predicted Price: {state.get('predicted_price')}
Market Trend: {state.get('market_trend')}
Recommendation: {state.get('recommendation')}


Explain the recommendation in simple terms.
"""
    response = chat_model.invoke(prompt)
    return {**state, "explanation": response.content}


# -----------------------------
# 5. Build LangGraph
# -----------------------------
graph = StateGraph(FoodState)


graph.add_node("predict", predict_price)
graph.add_node("analyze", analyze_market)
graph.add_node("recommend", recommend_action)
graph.add_node("explain", explain_recommendation)


graph.set_entry_point("predict")
graph.add_edge("predict", "analyze")
graph.add_edge("analyze", "recommend")
graph.add_edge("recommend", "explain")


app_graph = graph.compile()


# -----------------------------
# 6. API endpoint
# -----------------------------
@app.post("/runGraph")
def run_graph(item: InventoryItem):
    # Map frontend props to LangGraph input
    state_input = {
        "name": item.name,
        "quantity": item.quantity,
        "unit": item.unit,
        "original_price": item.originalPrice,
        "category": item.category,
        "expiry_date": item.expiryDate,
        "business": item.businessName,
        "description": item.description or "N/A"
    }


    result = app_graph.invoke(state_input)
    return {
        "recommendation": result.get("recommendation"),
        "explanation": result.get("explanation")
    }




