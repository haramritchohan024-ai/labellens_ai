import React from 'react';

const About = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-6 text-center transition-colors">About LabelLens AI</h1>

            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-8 mb-8 transition-colors duration-300 border border-transparent dark:border-neutral-700">
                <h2 className="text-2xl font-semibold text-green-700 dark:text-green-500 mb-4 transition-colors">Our Mission</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors">
                    Most consumers believe they understand food labels, but hidden additives and complex chemical names often obscure the truth.
                    LabelLens AI bridges the gap between regulatory standards and consumer understanding.
                </p>
                <p className="text-gray-600 dark:text-gray-300 transition-colors">
                    We empower you to make safer, healthier decisions by decoding E-numbers, highlighting risks, and suggesting better alternatives.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 transition-colors duration-300 border border-transparent dark:border-neutral-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors">How it Works</h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 transition-colors">
                        <li>Upload a picture of any packaged food label.</li>
                        <li>Our system extracts the text using OCR technology.</li>
                        <li>It identifies additives and cross-references them with safety data.</li>
                        <li>You get a simple 1-10 Safety Score and personalized warnings.</li>
                    </ul>
                </div>

                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 transition-colors duration-300 border border-transparent dark:border-neutral-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors">Disclaimer</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors">
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
