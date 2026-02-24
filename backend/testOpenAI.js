async function test() {
    try {
        const openaiModule = await import('openai');
        const OpenAI = openaiModule.default;
        console.log("OpenAI imported successfully:", !!OpenAI);
        const client = new OpenAI({ apiKey: "test" });
        console.log("Client created");
    } catch (err) {
        console.error("Import failed:", err);
    }
}
test();
