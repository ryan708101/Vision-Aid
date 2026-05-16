import { useState } from 'react';
import { Upload, Eye, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateDetectedDisease } from '../redux/userSlice.js' 


export default function Diagnose() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const handleDiagnose = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch('http://localhost:5000/api/diagnose', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        // Step 2: Update disease in backend via Redux thunk
        await dispatch(updateDetectedDisease({ 
          disease: data.prediction,
          token 
        })).unwrap();
      } else {
        setError(data.error || 'Failed to process image');
      }
    } catch (err) {
      setError('Unable to connect to the server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4 pt-44">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Eye className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Eye Disease Diagnosis</h1>
          <p className="text-gray-400">Upload an eye image for AI-powered analysis</p>
        </div>

        {/* Main Content */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">
          {/* Upload Area */}
          {!previewUrl ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center hover:border-green-500 transition-colors cursor-pointer"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-lg mb-2 text-gray-300">
                  Drop your image here or click to upload
                </p>
                <p className="text-sm text-gray-500">
                  Supports: JPG, PNG, JPEG
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Image Preview */}
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-96 object-contain rounded-xl bg-gray-800"
                />
                <button
                  onClick={handleClear}
                  className="absolute top-4 right-4 bg-gray-900/80 hover:bg-gray-800 p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Diagnose Button */}
              <button
                onClick={handleDiagnose}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5" />
                    Diagnose
                  </>
                )}
              </button>

              {/* Result Display */}
              {result && (
                <div
                  className={`p-6 rounded-xl border-2 ${
                    result.prediction === 'Normal'
                      ? 'bg-green-900/20 border-green-500'
                      : 'bg-yellow-900/20 border-red-500'
                  }`}
                >
                  <div className="flex items-start gap-4">

                    <div className="flex-1 flex flex-col justify-center items-center">
                      <h3 className="text-xl font-bold mb-2">
                        Diagnosis Result
                      </h3>
                      <p className="text-lg mb-2">
                        <span className="font-semibold">Status: </span>
                        <span
                          className={
                            result.prediction === 'Normal'
                              ? 'text-green-400'
                              : 'text-red-400'
                          }
                        >
                          {result.prediction}
                        </span>
                      </p>
                      {result.confidence && (
                        <p className="text-sm text-gray-400">
                          Confidence: {(result.confidence * 100).toFixed(2)}%
                        </p>
                      )}
                      {result.prediction !== 'Normal' && (
                        <p className="mt-4 text-sm text-gray-300 bg-gray-800/50 p-4 rounded-lg text-center">
                          ⚠️ This is an AI-based preliminary assessment. Please
                          consult with a qualified ophthalmologist for proper
                          diagnosis and treatment.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-900/20 border-2 border-red-500 p-6 rounded-xl">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold mb-2">Error</h3>
                      <p className="text-gray-300">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This tool uses AI to analyze eye images. Results are for reference
            only and should not replace professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}