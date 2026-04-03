import fetch from "node-fetch";

export const executeCode = async (req, res) => {
  const { language, code } = req.body;

  try {
    const prompt = `
You are a code execution engine.

Given the following code, simulate its execution and return ONLY the exact output printed to stdout.

Rules:
- Do NOT explain anything
- Do NOT add extra text
- Only return the output exactly
- If there is no output, return: No Output
- If there is an error, return only the error message

Language: ${language}

Code:
${code}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const output =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return res.json({
      success: true,
      output: output || "No Output"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

function getExtension(language) {
  const map = {
    javascript: "js",
    python: "py",
    java: "java"
  };
  return map[language] || "txt";
}