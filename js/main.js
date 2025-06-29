import { getCard } from './cardFinder.js';

async function testCardFinder() {
    console.log("--- Test Case 1: Find an existing card ---");
    try {
        const card1 = await getCard("comer", "Pretérito", "él/ella/usted");
        if (card1) {
            console.log("Card found:", card1);
            console.log(`Result: ${card1.pronoun} ${card1.conjugation}`);
        } else {
            console.log("Card not found.");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }

    console.log("\n--- Test Case 2: Search for a non-existent card ---");
    const card2 = await getCard("ser", "Futuro", "yo");
    if (card2) {
        console.log("Card found:", card2);
    } else {
        console.log("Card not found, as expected.");
    }
}

// Run the test function when the script loads.
testCardFinder();