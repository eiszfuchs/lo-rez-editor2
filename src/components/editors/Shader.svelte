<script>
    import { onMount, createEventDispatcher } from 'svelte';

    import {
        Button,
        Checkbox,
        InlineNotification,
    } from 'carbon-components-svelte';
    import Save from 'carbon-icons-svelte/lib/Save.svelte';

    import PickableImage from '../atoms/PickableImage.svelte';
    import CompareSwitcher from '../atoms/CompareSwitcher.svelte';
    import ComparePanel from '../atoms/ComparePanel.svelte';
    import FrameIndicator from '../atoms/FrameIndicator.svelte';

    import { drafts, shaders, versions } from '@/stores/project.js';
    import { selectedVersion } from '@/stores/mc-versions.js';
    import { closeOnSave } from '@/stores/settings.js';

    import { fromHex } from '@/modules/color.js';

    export let zipEntry;
    export let active = false;

    let vertexShaderSource = `
precision mediump float;

attribute vec2 a_position;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texcoord = a_texcoord;
}
`.trimStart();

    let fragmentShaderSource = `
precision mediump float;

uniform float time;

void main () {
    gl_FragColor = vec4(vec3(0.64), 0.71);
}
`.trimStart();

    const dispatch = createEventDispatcher();

    const dataUriPrefix = 'data:image/png;base64,';

    const dataToUri = (data) =>
        !data ? null : dataUriPrefix + btoa(data.toString('binary') || '');

    $: entryName = zipEntry?.entryName;
    $: previewSrc = dataToUri(zipEntry?.getData());

    let gl;
    let program;
    let vbo = {};
    let timeLocation;

    let frame = 0;
    let totalFrames = 1;
    let canvas = null;

    let shaderValid = true;
    let hoverInfo = '';

    let isDraft = false;

    function init() {
        isDraft = drafts.get(entryName, false);
        fragmentShaderSource = shaders.get(entryName, fragmentShaderSource);
    }

    // Init like this to prevent re-load when another editor is opened
    $: init(previewSrc);

    function updateShaders() {
        if (!gl) return;

        shaderValid = true;

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);
        timeLocation = gl.getUniformLocation(program, 'time');

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            shaderValid = false;
        }

        gl.detachShader(program, vertexShader);
        gl.detachShader(program, fragmentShader);

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
    }

    function setupWebGL() {
        if (!(gl = getRenderingContext())) return;

        // https://stackoverflow.com/a/30164470
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        program = gl.createProgram();
        updateShaders();

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            cleanup();
            console.error('Shader program did not link successfully.');
            return;
        }

        initializeAttributes();
        gl.useProgram(program);
        redraw();
    }

    function redraw() {
        if (!gl) return;

        const time = frame / totalFrames;
        gl.uniform1f(timeLocation, time);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function initializeAttributes() {
        const texCoordsLoc = gl.getAttribLocation(program, 'a_texcoord');
        vbo.texCoords = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo.texCoords);
        // prettier-ignore
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordsLoc);
        gl.vertexAttribPointer(texCoordsLoc, 2, gl.FLOAT, false, 0, 0);

        const verticesLoc = gl.getAttribLocation(program, 'a_position');
        vbo.vertices = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo.vertices);
        // prettier-ignore
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(verticesLoc);
        gl.vertexAttribPointer(verticesLoc, 2, gl.FLOAT, false, 0, 0);
    }

    function cleanup() {
        gl.useProgram(null);
        for (const buffer of vbo) {
            gl.deleteBuffer(buffer);
        }
        if (program) gl.deleteProgram(program);
    }

    function getRenderingContext() {
        var gl =
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl');

        if (!gl) {
            console.error('Failed to get WebGL context.');
            return null;
        }

        gl.viewport(0, 0, canvas.width, canvas.height);

        return gl;
    }

    $: {
        updateShaders(fragmentShaderSource);
        redraw();
    }

    setInterval(() => {
        frame = (frame + 1) % totalFrames;
        redraw();
    }, 1000 / 12);

    onMount(setupWebGL);

    const colorToVec4 = (color) =>
        color
            ? `vec2(${fromHex(color)
                  .map((d) => (d / 0xff).toFixed(2))
                  .join(', ')})`
            : '';

    function onPickableHover({ detail: { color } }) {
        hoverInfo = colorToVec4(color);
    }

    function onSave() {
        drafts.set(entryName, isDraft);
        versions.set(entryName, $selectedVersion);
        shaders.set(entryName, fragmentShaderSource);

        if ($closeOnSave) {
            dispatch('close');
        }
    }
</script>

<div class="editor" class:active>
    <InlineNotification kind="warning">
        Shaders were a shower thought and might not be used in the final editor.
        You can still toy around with it, though.
    </InlineNotification>

    <div class="layout-box">
        <div>
            <CompareSwitcher>
                <ComparePanel label={$selectedVersion}>
                    <div class="texture-parent">
                        <PickableImage
                            src={previewSrc}
                            scale={12}
                            bind:frame
                            bind:totalFrames
                            on:hover={onPickableHover}
                        />
                    </div>

                    <div class="info">
                        <code>&ZeroWidthSpace;{hoverInfo}</code>
                    </div>
                </ComparePanel>
            </CompareSwitcher>
        </div>

        <div>
            <CompareSwitcher>
                <ComparePanel label="Rendered">
                    <div class="texture-parent">
                        <canvas bind:this={canvas} width="8" height="8" />
                    </div>
                </ComparePanel>

                <ComparePanel label="Exported">
                    <div class="texture-parent" />
                </ComparePanel>
            </CompareSwitcher>
        </div>
    </div>

    <div class="frames">
        <FrameIndicator bind:frame bind:totalFrames />
    </div>

    <textarea class="grow" bind:value={fragmentShaderSource} />

    <div class="actions">
        <div class="action-group">
            <Checkbox labelText="Draft" size="sm" bind:checked={isDraft} />
        </div>

        <div class="action-group">
            <Button
                disabled={!shaderValid}
                kind="primary"
                size="field"
                icon={Save}
                on:click={onSave}
            >
                Save
            </Button>
        </div>
    </div>
</div>

<style lang="scss">
    .editor {
        display: flex;
        flex-direction: column;
        gap: var(--cds-spacing-02);

        min-height: 100%;

        &:not(.active) {
            display: none;
        }
    }

    canvas {
        image-rendering: pixelated;
        background: var(--tex-transparent-background);
        background-position: center;
    }

    textarea {
        border-radius: 0;
        border: none;
        outline: none;
        box-shadow: none;

        color: var(--cds-text-01);
        background-color: var(--cds-field-01);

        padding: var(--cds-spacing-03);

        font-family: var(--cds-code-01-font-family);
        font-size: var(--cds-code-01-font-size);
        font-weight: var(--cds-code-01-font-weight);
        line-height: var(--cds-code-01-line-height);
        letter-spacing: var(--cds-code-01-letter-spacing);
    }

    .grow {
        flex: 1 0 auto;
        display: flex;
    }

    .layout-box {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        gap: var(--cds-spacing-02);

        > * {
            flex: 1 1 1%;
            min-width: 1px;
        }
    }

    .texture-parent {
        display: flex;
        align-items: center;
        justify-content: center;

        padding: var(--cds-spacing-03);

        > * {
            margin: auto;

            width: 16px * 12;
            height: 16px * 12;
        }
    }

    .frames {
        background-color: var(--cds-field-01);

        padding: var(--cds-spacing-03);
    }

    .info {
        display: flex;
        align-items: center;
        justify-content: center;

        padding: var(--cds-spacing-03);
        padding-top: 0;
    }

    .actions {
        margin-top: auto;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
</style>
