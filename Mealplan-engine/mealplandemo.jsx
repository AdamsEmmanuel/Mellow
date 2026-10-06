import React, { useState } from "react";
import MealPlanView, { MEAL_PAYLOAD, HERBAL_PAYLOAD } from "./MealPlanView";

export default function MealPlanDemo() {
  const [type, setType] = useState("MEAL");
  const payload = type === "MEAL" ? MEAL_PAYLOAD : HERBAL_PAYLOAD;

  return (
    <div style={{ background: "#EFEAE0", minHeight: "100vh", paddingBottom: "2rem" }}>
      <div
        style={{
          position: "sticky", top: 0, zIndex: 50, display: "flex", justifyContent: "center",
          gap: ".5rem", padding: ".85rem", background: "#1E2220",
        }}
      >
        {["MEAL", "HERBAL_PRODUCT"].map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              padding: ".5rem 1rem", borderRadius: 100, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: ".78rem", fontFamily: "'DM Sans', sans-serif",
              background: type === t ? "#0A3C26" : "rgba(255,255,255,.1)",
              color: type === t ? "#fff" : "rgba(255,255,255,.6)",
            }}
          >
            {t === "MEAL" ? "🍽️ Meal Flow" : "🌿 Herbal Flow"}
          </button>
        ))}
      </div>
      <MealPlanView
        key={payload.id}
        payload={payload}
        onBack={() => alert("Back pressed (would return to plan list)")}
        onSyncProgress={(id, steps) => console.log("sync (no PHI logged):", id, steps.length, "steps done")}
      />
    </div>
  );
}