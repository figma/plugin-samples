<script lang="ts">
    let count: number = 5;

    const handleCreateRectangles = (): void => {
        parent.postMessage({ pluginMessage: { type: 'create-rectangles', count } }, '*')
    }

    const handleClosePlugin = (): void => {
        parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
    }
</script>

<main>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M27 5V27H5M31 9V31H9M1 1H23V23H1V1Z" stroke="black" stroke-width="2"/>
    </svg>
    <h2>Rectangle Creator</h2>
    <p>Count: <input bind:value={count} type="text"></p>
    <button class="create" on:click={handleCreateRectangles}>Create</button>
    <button on:click={handleClosePlugin}>Cancel</button>
</main>

<style>
    main {
        font: 12px sans-serif;
        text-align: center;
        margin: 20px;
    }

    button {
        border-radius: 5px;
        background: white;
        color: black;
        border: none;
        padding: 8px 15px;
        margin: 0 5px;
        box-shadow: inset 0 0 0 1px black;
        outline: none;
    }

    .create {
        box-shadow: none;
        background: #18A0FB;
        color: white;
    }

    input {
        border: none;
        outline: none;
        padding: 8px;
    }

    input:hover { box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1); }
    button:focus { box-shadow: inset 0 0 0 2px #18A0FB; }
    .create:focus { box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.3); }
    input:focus { box-shadow: inset 0 0 0 2px #18A0FB; }
</style>
