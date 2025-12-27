import streamlit as st
import pandas as pd
from sqlalchemy import create_engine, text

st.set_page_config(page_title="Internal Audit Dashboard", layout="wide")

db_url = st.secrets["DB_URL"]

st.write("DB URL being used:", db_url)  # TEMP

engine = create_engine(
    db_url,
    connect_args={"sslmode": "require"}
)
# engine = create_engine("postgresql://postgres:internal-audit-db@db.vieawzynjplornfzwtwv.supabase.co:6543/postgres?sslmode=require")
# engine = create_engine("postgresql://postgres:internal-audit-db@db.vieawzynjplornfzwtwv.supabase.co:5432/postgres")

@st.cache_data
def load_full_table():
    with engine.connect() as conn:
        df = pd.read_sql("SELECT * FROM audit_types", conn)
    return df

df = load_full_table()

st.title("Internal Audit Dashboard")

# Dropdown filters
internal_audit = st.selectbox(
    "Internal Audit",
    options=sorted(df["internal_audit"].dropna().unique())
)

sector = st.selectbox(
    "Sector",
    options=sorted(df[df.internal_audit == internal_audit]["sector"].dropna().unique())
)

family = st.selectbox(
    "Family",
    options=sorted(df[(df.internal_audit == internal_audit) &
                      (df.sector == sector)]["family"].dropna().unique())
)

category = st.selectbox(
    "Category",
    options=sorted(df[(df.internal_audit == internal_audit) &
                      (df.sector == sector) &
                      (df.family == family)]["category"].dropna().unique())
)

type_of_audit = st.selectbox(
    "Type of Audit",
    options=sorted(df[(df.internal_audit == internal_audit) &
                      (df.sector == sector) &
                      (df.family == family) &
                      (df.category == category)]["type_of_audit"].dropna().unique())
)

# Retrieve the selected row
row = df[(df.internal_audit == internal_audit) &
         (df.sector == sector) &
         (df.family == family) &
         (df.category == category) &
         (df.type_of_audit == type_of_audit)].iloc[0]

# Display the content exactly like your UI
st.header("📋 Audit Details")

st.subheader("📝 Description")
st.info(row["description"])

st.subheader("⏱ When to Use")
st.info(row["when_to_use"])

st.subheader("⚙ Framework or Criteria")
st.info(row["framework_or_criteria"])
