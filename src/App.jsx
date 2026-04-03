import { useState } from 'react';
import './index.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    
    const token = import.meta.env.VITE_HF_ACCESS_TOKEN;
    if (!token || token === 'your_token_here') {
      alert("⚠️ Error: Missing API Token!\n\nPlease add your Hugging Face Access Token to the .env file and restart your terminal server (npm run dev).");
      setIsGenerating(false);
      return;
    }

    try {
      // Removing local vite proxy and fetching directly for Vercel production deployment
      const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: prompt }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to generate image.";
        try {
          const errData = await response.json();
          errorMessage = errData.error || errorMessage;
        } catch (err) {}
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>DreamCanvas</h1>
        <p>Turn your imagination into reality</p>
      </header>

      <main className="main-content">
        <form className="generation-form" onSubmit={handleGenerate}>
          <div className="input-group">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to see..."
              disabled={isGenerating}
              className="prompt-input"
            />
            <button 
              type="submit" 
              className={`generate-btn ${isGenerating ? 'generating' : ''}`}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <span className="loader"></span>
              ) : (
                'Generate'
              )}
            </button>
          </div>
        </form>

        <section className="image-display-section">
          {generatedImage ? (
            <div className="image-wrapper">
              <img src={generatedImage} alt={`Generated: ${prompt}`} className="generated-image" />
            </div>
          ) : (
            <div className="empty-state">
              <div className="placeholder-icon">✨</div>
              <p>Your creation will appear here</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
