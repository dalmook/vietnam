export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                ink: "#1D2144",
                ocean: "#0F8B8D",
                sky: "#A7F3D0",
                mint: "#A1F0D8",
                sand: "#FFF8EA",
                coral: "#FF7A59",
                gold: "#FFC857",
                shell: "#F6F7FB"
            },
            boxShadow: {
                float: "0 18px 50px rgba(29, 33, 68, 0.12)",
                soft: "0 12px 34px rgba(29, 33, 68, 0.12)"
            },
            backgroundImage: {
                grain: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.7), transparent 35%), radial-gradient(circle at 80% 0%, rgba(167,243,208,0.38), transparent 28%), linear-gradient(180deg, #fffdf8 0%, #f8f8ff 100%)"
            }
        }
    },
    plugins: []
};
