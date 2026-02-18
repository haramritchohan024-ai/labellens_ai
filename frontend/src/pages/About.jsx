import React from 'react';

const About = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">About LabelLens AI</h1>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-semibold text-green-700 mb-4">Our Mission</h2>
                <p className="text-gray-600 mb-4">
                    Most consumers believe they understand food labels, but hidden additives and complex chemical names often obscure the truth.
                    LabelLens AI bridges the gap between regulatory standards and consumer understanding.
                </p>
                <p className="text-gray-600">
                    We empower you to make safer, healthier decisions by decoding E-numbers, highlighting risks, and suggesting better alternatives.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">How it Works</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                        <li>Upload a picture of any packaged food label.</li>
                        <li>Our system extracts the text using OCR technology.</li>
                        <li>It identifies additives and cross-references them with safety data.</li>
                        <li>You get a simple 1-10 Safety Score and personalized warnings.</li>
                    </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Disclaimer</h3>
                    <p className="text-gray-600 text-sm">
                        This tool provides information based on general food safety research and regulatory limits (including FSSAI/codex standards).
                        It is <strong>not medical advice</strong>. Always consult a healthcare professional for specific medical conditions.
                        Risk levels are estimates based on available data.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
