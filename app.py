import os
import json
from dotenv import load_dotenv
from groq import Groq
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from datetime import datetime
from flask import send_file
from flask import send_from_directory

# ----------------------------
# Load Environment Variables
# ----------------------------
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY not found in .env file.")

print("✅ GROQ_API_KEY loaded successfully")

# ----------------------------
# Load Product Data
# ----------------------------
PRODUCT_JSON_PATH = "product_files/product_catalog.json"

if not os.path.exists(PRODUCT_JSON_PATH):
    raise FileNotFoundError(f"❌ {PRODUCT_JSON_PATH} not found.")

with open(PRODUCT_JSON_PATH, "r", encoding="utf-8") as f:
    try:
        products = json.load(f)

        if not isinstance(products, list):
            raise ValueError("❌ product_catalog.json must be a LIST of products")

        print(f"✅ Loaded {len(products)} products from catalog")

    except json.JSONDecodeError:
        raise ValueError(f"❌ Invalid JSON format in {PRODUCT_JSON_PATH}")

if not products:
    raise ValueError("❌ No products found in JSON file.")

# ----------------------------
# Flatten Product Data for Vector Search
# ----------------------------
docs = []
for p in products:
    name = p.get("service", "Unnamed Product")
    description = p.get("description", "No description available.")
    docs.append(f"{name}: {description}")

    types_of_campaigns = p.get("typesOfCampaigns")
    if isinstance(types_of_campaigns, dict):
        for campaign_type, campaign_info in types_of_campaigns.items():
            docs.append(f"{campaign_type}: {campaign_info.get('description', '')} - Ideal For: {campaign_info.get('idealFor','')}")

    benefits = p.get("benefits")
    if isinstance(benefits, dict):
        for key, value in benefits.items():
            docs.append(f"Benefit - {key}: {value}")

    why_choose_us = p.get("whyChooseUs")
    if isinstance(why_choose_us, dict):
        for key, value in why_choose_us.items():
            docs.append(f"Why Choose Us - {key}: {value}")

    faqs = p.get("faqs")
    if isinstance(faqs, list):
        for faq in faqs:
            question = faq.get("question", "")
            answer = faq.get("answer", "")
            if question and answer:
                docs.append(f"FAQ - Q: {question} A: {answer}")

    contact = p.get("contact")
    if isinstance(contact, dict):
        if "phone" in contact:
            docs.append(f"Contact Phone: {contact['phone']}")
        if "email" in contact:
            docs.append(f"Contact Email: {contact['email']}")
        if "title" in contact:
            docs.append(f"Contact Title: {contact['title']}")
        if "description" in contact:
            docs.append(f"About Us: {contact['description']}")
        
        offices = contact.get("offices")
        if isinstance(offices, dict):
            for country, addr in offices.items():
                docs.append(f"Office in {country.capitalize()}: {addr}")

    # Add service-specific sections
    seo_services = p.get("seoServices")
    if isinstance(seo_services, dict):
        for service, info in seo_services.items():
            docs.append(f"SEO Service - {service}: {info.get('description', '')}")

    seo_process = p.get("seoProcess")
    if isinstance(seo_process, list):
        for step in seo_process:
            docs.append(f"Process Step - {step.get('step', '')}: {step.get('description', '')}")

print(f"✅ Created {len(docs)} document chunks for vector search")

# ----------------------------
# Create Embeddings + VectorStore
# ----------------------------
print("⏳ Loading embeddings model...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
print("⏳ Creating vector store...")
vectorstore = Chroma.from_texts(docs, embeddings)
retriever = vectorstore.as_retriever()
print("✅ Vector store created successfully")

# ----------------------------
# Initialize Groq Client
# ----------------------------
client = Groq(api_key=GROQ_API_KEY)

# ----------------------------
# Flask App with CORS
# ----------------------------
app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# ----------------------------
# Casual Responses Dictionary
# ----------------------------
CASUAL_RESPONSES = {
    "hi": "Hello! 👋 Welcome to Emerging Software. How can I assist you today?",
    "hello": "Hi there! 😊 How can I help you with our services?",
    "hey": "Hey! 👋 What would you like to know?",
    "how are you": "I'm doing great! 😊 Ready to help you succeed. What can I assist with?",
    "i'm fine": "Great to hear! 😊 Now, how can I help your business?",
    "thanks": "You're welcome! 🙌 Feel free to ask anything else.",
    "thank you": "Happy to help! 😊",
    "bye": "Goodbye! 👋 Have a great day!",
    "ok": "Okay! Let me know if you need more info.",
    "yes": "Great! What else would you like to know?",
    "no": "No problem! Feel free to ask anything else.",
}

# ----------------------------
# Routes
# ----------------------------


@app.route("/")
def index():
    """Serve the main chat interface"""
    return send_file(r"C:\Users\Mega Point\Downloads\project emerging\index.html")

@app.route("/<path:filename>")
def serve_files(filename):
    """Serve CSS, JS, images, videos, etc. from the same folder as index.html"""
    return send_from_directory(
        r"C:\Users\Mega Point\Downloads\project emerging",
        filename
    )

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "products_loaded": len(products)
    }), 200

@app.route("/ask", methods=["POST", "OPTIONS"])
def ask():
    """
    Main API Endpoint for chatbot
    
    Request: {"query": "user message", "conversation_id": "optional"}
    Response: {"answer": "bot response"}
    """
    
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    try:
        user_query = request.json.get("query", "").strip()
        
        if not user_query:
            return jsonify({"answer": "Please type a question to get started!"}), 400

        lower_query = user_query.lower().strip()

        # ----------------------------
        # Check for casual conversation
        # ----------------------------
       # Casual responses only for very short inputs
        if len(lower_query.split()) <= 3:
        
           for key, resp in CASUAL_RESPONSES.items():
              if lower_query == key:
                return jsonify({"answer": resp}), 200
        

        import re
        clean_query = re.sub(r"[^\w\s]", "", lower_query)


        # ----------------------------
        # Retrieve relevant context from product docs
        # ----------------------------
        try:
            context_docs = vectorstore.similarity_search(user_query, k=5)
            context = "\n".join([doc.page_content for doc in context_docs])
            
            if not context.strip():
                context = "No specific information found."
        except Exception as e:
            print(f"❌ Error in vector search: {str(e)}")
            context = "Unable to retrieve context."

        # ----------------------------
        # Prepare prompt for Groq AI
        # ----------------------------
        prompt = f"""You are a helpful AI assistant for Emerging Software, a leading digital marketing agency in the Middle East.

COMPANY PROFILE:
- Provides services: Email Marketing, Digital Marketing, SEO, Content Writing, PPC, Social Media, Affiliate Marketing, Website Development & Design
- Focus: Middle Eastern market
- Locations: Pakistan, USA, Qatar
- Contact: director@emergingssoftware.com | +1 830 631 0316

PRODUCT CONTEXT:
{context}

USER QUESTION: {user_query}

INSTRUCTIONS:
1. Answer ONLY using the provided product data and company information
2. Be friendly, professional, and focused on solutions
3. Keep responses to 3-5 sentences unless more detail is needed
4. Include relevant contact info when appropriate
5. Use emojis sparingly for emphasis
6. If the question is outside our scope, politely redirect to our services
7. Never make up services or information not in the context
8. Encourage specific service inquiries or contact us for consultations

ANSWER:"""

        # ----------------------------
        # Call Groq API
        # ----------------------------
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        
        answer = response.choices[0].message.content.strip()
        
        print(f"✅ Query: {user_query[:50]}... | Response length: {len(answer)}")
        
        return jsonify({"answer": answer}), 200

    except Exception as e:
        print(f"❌ Error in /ask endpoint: {str(e)}")
        return jsonify({
            "answer": "Sorry, I encountered an error processing your request. Please try again or contact us directly at director@emergingssoftware.com"
        }), 500

# ----------------------------
# Error Handlers
# ----------------------------

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

@app.before_request
def log_request():
    """Log incoming requests"""
    if request.endpoint not in ['static']:
        print(f"📨 {request.method} {request.path} from {request.remote_addr}")

# ----------------------------
# Main Execution
# ----------------------------

if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 EMERGING SOFTWARE CHATBOT SERVER")
    print("="*50)
    print(f"📦 Products loaded: {len(products)}")
    print(f"📄 Document chunks: {len(docs)}")
    print("🔐 CORS enabled")
    print("="*50 + "\n")
    
    # Development mode
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000,
        use_reloader=True
    )
    
    # For production, use:
    # from waitress import serve
    # serve(app, host="0.0.0.0", port=5000)