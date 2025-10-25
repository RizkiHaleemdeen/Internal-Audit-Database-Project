# internal_audit_dashboard_full.py
import streamlit as st
import pandas as pd

st.set_page_config(page_title="Internal Audit Dashboard", layout="wide")

st.title("📊 Internal Audit Dashboard")

# --- File Upload ---
uploaded_file = st.file_uploader("Upload your Excel file", type=["xlsx", "xls"])

if uploaded_file:
    df = pd.read_excel(uploaded_file)
    df.columns = [col.strip() for col in df.columns]

    # --- Dropdown Columns ---
    col_order = ["Internal Audit", "Sector", "Family", "Category", "Type of Audit"]
    filters = {}
    filtered_df = df.copy()

    # --- Cascading Dropdowns ---
    cols = st.columns(5)
    for i, col_name in enumerate(col_order):
        # Available options depend on previous selections
        options = [""] + sorted(filtered_df[col_name].dropna().unique().tolist())
        filters[col_name] = cols[i].selectbox(col_name, options, key=col_name)

        # Filter progressively as user selects values
        if filters[col_name]:
            filtered_df = filtered_df[filtered_df[col_name] == filters[col_name]]

    # --- Check if all filters are selected ---
    all_selected = all(filters[col] for col in col_order)

    st.markdown("---")
    st.subheader("🧾 Audit Details")

    # --- Display Panels ---
    colA, colB, colC = st.columns(3)

    if all_selected and not filtered_df.empty:
        record = filtered_df.iloc[0]

        with colA:
            st.markdown("### 📝 Description")
            st.info(record.get("Description", "N/A"))
        with colB:
            st.markdown("### ⏱️ When_to_use")
            st.info(record.get("When_to_use", "N/A"))
        with colC:
            st.markdown("### ⚙️ Framework_or_Criteria")
            st.info(record.get("Framework_or_Criteria", "N/A"))

        # --- Display full table of matching records ---
        st.markdown("### 📋 Matching Records")
        st.dataframe(filtered_df.reset_index(drop=True))

    else:
        with colA:
            st.markdown("### 📝 Description")
            st.empty()
        with colB:
            st.markdown("### ⏱️ When_to_use")
            st.empty()
        with colC:
            st.markdown("### ⚙️ Framework_or_Criteria")
            st.empty()

        if not all_selected:
            st.warning("Please select all dropdowns to view audit details.")
        elif filtered_df.empty:
            st.error("No records match your selected criteria.")
else:
    st.info("👆 Please upload an Excel file to begin.")
