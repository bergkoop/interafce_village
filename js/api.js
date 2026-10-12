// api.js: all fetch functions (D&D API and JokeAPI) go here
// These functions only fetch data. If something goes wrong they throw an error,
// and the file that calls them catches it with try/catch.

export const DND_URL = 'https://www.dnd5eapi.co';

// Only monsters with these challenge ratings, so no impossible dragons
const QUEST_LEVELS = '1,2,3,4,5';

// Gets a list of monsters (each one only has index, name and url)
export const getMonsterList = async () => {
    const response = await fetch(`${DND_URL}/api/2014/monsters?challenge_rating=${QUEST_LEVELS}`);

    if (!response.ok) {
        throw new Error(`Could not load the monster list (status ${response.status})`);
    }

    const data = await response.json();
    return data.results;
};

// Gets all details of one monster, e.g. getMonster('owlbear')
export const getMonster = async (index) => {
    const response = await fetch(`${DND_URL}/api/2014/monsters/${index}`);

    if (!response.ok) {
        throw new Error(`Could not find monster "${index}" (status ${response.status})`);
    }

    return await response.json();
};
