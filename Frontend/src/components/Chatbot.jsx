import React, { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, MessageSquare, Send } from "lucide-react";
import axios from "axios";


const highlightText = (text) => {
  
  const regex = /(\*\*[^*]+\*\*|\"[^\"]+\")/g;

  return text.split(regex).map((part, index) => {
    
    if (part.startsWith("**") || part.startsWith("\"")) {
      return (
        <span key={index} className="bg-yellow-300 font-bold">{part}</span>
      );
    }
    return part; 
  });
};


function Chatbot() {
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const chatRef = useRef(null);

  const onDrop = async (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);
    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setExtractedText(response.data.text);
      console.log(response.data.text)
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
  });

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const newMessage = { type: "question", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput(""); 

    const formData = new FormData();
    formData.append("question", input);
    formData.append("text", extractedText);

    try {
      const response = await axios.post("http://127.0.0.1:8000/ask", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const aiMessage = { type: "answer", text: response.data.answer };
      console.log(response)
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching answer:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col items-center space-y-6 p-6 w-full max-w-2xl mx-auto">
      {!file ? (<div>
        <p className="text-center font-bold text-4xl w-full my-6">Welcome to <span className="text-green-500 ">Document QA ChatBot,</span></p>
        <div
          {...getRootProps()}
          className="border-2 border-dashed p-6 w-full text-center cursor-pointer rounded-lg h-[40vh] flex flex-col justify-center "
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto mb-2 text-gray-500" size={32} />
          <p className="text-gray-600">Drop your PDF or TXT file here or click to upload.</p>
        </div>
      </div>
        
      ) : (<div className="w-full bg-white shadow-lg rounded-lg flex flex-col h-[90vh] ">
        
          <div className="bg-green-500 text-white text-center py-3 font-bold rounded-t-lg">
            AI ChatBot
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 ${
                  msg.type === "question" ? "justify-end" : "justify-start"
                }`}
              >   
                {msg.type === "answer" && <MessageSquare className="text-gray-500" size={16} />}
                <div
                  className={`px-4 py-2 rounded-lg max-w-xs ${
                    msg.type === "question"
                      ? "bg-blue-500 text-white self-end"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {highlightText(msg.text)}
                </div>
              </div>
            ))}
            <div ref={chatRef} />
          </div>

          <div className="flex p-3 border-t">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 p-2 border border-gray-300 rounded-md"
            />
            <button
              className="ml-2 bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
              onClick={handleSendMessage}
              disabled={loading}
            >
              {loading ? "..." : <Send size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
