# 🌟 LangCanvas: Visual Workflow Editor for LangGraph

LangCanvas is an intuitive, user-friendly, and frontend-only visual editor for building, editing, and managing complex LangGraph workflows entirely in your browser. It simplifies the design and modification of AI-driven stateful workflows through an interactive drag-and-drop interface.

---

## 🚀 Overview

LangCanvas allows you to:

* Visually create LangGraph workflows
* Import and export workflows in JSON format
* Edit every detail of LangGraph nodes using intuitive UI controls
* Manage complex branching logic and node configurations without writing any code
* Save and load your work locally, no registration or backend required

---

## 🛠️ Features

* **Visual Drag-and-Drop Interface:** Easily add, move, and configure nodes.
* **Complete Node Customization:** Edit node parameters, logic, retry policies, timeouts, and metadata directly in the UI.
* **Import & Export:** Load existing LangGraph workflows and export changes seamlessly in JSON format.
* **Frontend-Only:** No server-side dependency, entirely browser-based.
* **User-Friendly Design:** Clear UI, minimal learning curve, highly accessible for both beginners and experts.

---

## 🔧 Technology Stack

* **React** for interactive UI
* **D3.js or React Flow** for visual workflow management
* **Tailwind CSS** for responsive and clean styling
* **JSON** for structured workflow import/export

---

## 🎨 Getting Started

### Prerequisites

Ensure you have Node.js and npm installed on your system.

### Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/langcanvas.git
cd langcanvas
npm install
```

### Development

Run the development server:

```bash
npm start
```

Open your browser and go to `http://localhost:3000`.

---

## 📚 Usage

* **Creating Workflows:** Use the sidebar to drag nodes into the canvas.
* **Editing Nodes:** Click a node to open its configuration panel to modify properties and logic.
* **Importing Workflows:** Use the import option to load existing LangGraph JSON files.
* **Exporting Workflows:** Save your current workflow locally by exporting to JSON.

---

## 📂 JSON Workflow Structure

LangCanvas saves workflows in a structured JSON format for easy portability and readability:

```json
{
  "nodes": [
    {
      "id": "unique_node_id",
      "type": "agent|tool|function|conditional|parallel|end",
      "label": "Node Label",
      "function": {
        "name": "python_function_name",
        "input_schema": {"param1": "type"},
        "output_schema": {"output1": "type"}
      },
      "config": {"timeout": 30}
    }
  ],
  "edges": [{"from": "node1", "to": "node2"}],
  "meta": {"created_by": "LangCanvas", "version": "1.0"}
}
```

---

## 📌 Roadmap

* Enhanced conditional logic builder
* Additional export formats (YAML, Python)
* Collaboration and version control integration

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push your branch (`git push origin feature/YourFeature`).
5. Open a pull request.

---

## 📝 License

LangCanvas is open-source and released under the MIT License. See [LICENSE](https://github.com/LangCanvas/langcanvas/blob/main/LICENSE.txt) for more details.

---

## 📞 Contact

For questions, suggestions, or issues, please reach out via:

* **Email:** [bdevay@gmail.com](mailto:bdevay@gmail.com)
* **GitHub Issues:** [Issues](https://github.com/LangCanvas/langcanvas/issues)

---

🌟 **Happy Workflow Building!** 🌟
