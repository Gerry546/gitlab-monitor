<script setup>
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import YAML from 'yaml';
import Config from './components/configuration/Config';

let refreshIntervalId = null;

const name = ref('app');
const projects = ref([]);
const zoom = ref(1);
const loaded = ref(false);
let configured = ref(false);
let config = ref('');
// const styleOverride = ref('');
const editCustomStyles = ref(false);
// const monacoOptions = {
//     theme: 'vs-dark',
//     tabSize: 2,
//     minimap: {
//         enabled: false
//     },
//     scrollBeyondLastLine: false
// };

const configIsValid = computed(() => {
    console.log('configIsValid');
    try {
        YAML.parse(config.value);
        return true;
    } catch (e) {
        return false;
    }
});

onBeforeMount(() => {
    console.log('onBeforeMount');
    reloadConfig();
});

onBeforeUnmount(() => {
    console.log('onBeforeUnmount');
    stopInterval(refreshIntervalId);
});

function reloadConfig() {
    console.log('reloadConfig');
    const twoMinutes = 2 * 60 * 100
    let enableInterval;
    let stopInterval;

    if (!configured && Config.isServerConfigured) {
        loaded = false;
        projects = [];
        fetchProjects();

        if (Config.root.autoZoom) {
            if (autoZoomIntervalId) {
                clearInterval(autoZoomIntervalId)
            }

            autoZoomIntervalId = setInterval(() => {
                autoZoom()
            }, 5000)
        }

        if (refreshIntervalId) {
            stopInterval(refreshIntervalId);
        }

        if (Config.root.backgroundRefresh) {
            enableInterval = (t, f) => setInterval(f, t);
            stopInterval = (i) => clearInterval(i);
        } else {
            enableInterval = Visibilty.every;
            stopInterval = Visibilty.stop;
        }

        refreshIntervalId = enableInterval(
            twoMinutes * Config.root.pollingIntervalMultiplier,
            async () => {
                if (!loaded) {
                    await fetchProjects()
                }
            }
        )
    }

    configured = Config.isServerConfigured;

    if (configured) {
        config = YAML.stringify(Config.local, null, 2)
    } else {
        config = YAML.stringify(require('../config.template'), null, 2)
    }
}

function stopInterval(intervalId) {
    console.log('stopInterval');
    clearInterval(intervalId);
}

async function fetchProjects() {
    console.log('fetchProjects');
}

function saveConfig() {
    console.log('saveConfig');
    Config.load(YAML.parse(config), styleOverride);
    reloadConfig();
}

function getTitle() {
    return Config.root.title || null
}

function showRunnerStatus() {
    return Config.root.showRunnerStatus
}

</script>

<template>
    <div class="app">
        <template v-if="loaded && configured">
            <div ref="content" class="content" :style="{ zoom }">
                <h1 class="title" v-if="!!getTitle()">{{ getTitle() }}</h1>
                <div class="projects">
                    <!-- <project-card v-for="project in sortedProjects" :key="project.id" :project-id="project.id" /> -->
                </div>
                <div v-if="configured" class="configure" @click.prevent.stop="configured = false">
                    Configure
                </div>
            </div>
            <div v-if="showRunnerStatus()">
                <!-- <runner-status /> -->
            </div>
        </template>
        <div v-else-if="!configured" class="container">
            <h1>Configuration</h1>
            <p>
                To use GitLab Monitor, it has to be configured.<br>
                Configuration is done by supplying YAML formatted options,<br>
                all configuration options are described <a
                    href="https://github.com/timoschwarzer/gitlab-monitor/blob/main/CONFIGURATION.md#configuration-options"
                    target="_blank">here</a>.<br>
                Your configuration is being persisted in this browser.
            </p>
            <!-- <monaco-editor v-model="config" language="yaml" class="config" :options="monacoOptions" /> -->
            <p class="error" v-if="!configIsValid">
                YAML is invalid!
            </p>

            <template v-if="editCustomStyles">
                <h1>Custom styles</h1>
                <!-- <monaco-editor v-model="styleOverride" language="css" class="config" :options="monacoOptions" /> -->
            </template>

            <button :disabled="!configIsValid" @click="saveConfig">Save</button>
            <button v-if="!editCustomStyles" @click="editCustomStyles = true">Add custom styles</button>
        </div>
        <!-- <div v-else class="loader">
            <octicon name="sync" spin scale="3" />
        </div> -->
    </div>
</template>

<style lang="scss">
:root {
    --background-color: #212121;
    --color: #dddddd;
    --font-family: Roboto, sans-serif;
    --background: url('assets/backdrop.svg') no-repeat bottom;
}

html {
    background-color: var(--background-color);
    color: var(--color);
    font-family: var(--font-family);
}

body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    min-height: 100vh;
    background: url('assets/backdrop.svg') no-repeat bottom;
    background-size: contain;
}

svg {
    overflow: visible;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s
}

.fade-enter,
.fade-leave-to {
    opacity: 0
}

button {
    padding: 8px;
    margin-right: 4px;
    background: #2e2e2e;
    border: 1px solid white;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
}
</style>

<style lang="scss" scoped>
.app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    flex-grow: 0;

    .content {
        flex-grow: 1;
        overflow-y: auto;
    }

    .title {
        text-align: center;
        margin-left: 8px;
        margin-right: 8px;
    }

    .projects {
        display: flex;
        flex-wrap: wrap;
        justify-content: left;
    }

    .loader {
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--loading-overlay-color, rgba(#212121, 0.5));
        color: var(--loading-indicator-color, inherit);
    }

    .container {
        height: 100%;
        overflow-y: auto;
        padding: 0 16px 1em;
        background-color: rgba(0, 0, 0, 0.5);
    }

    .config {
        margin-bottom: 8px;
        min-height: 500px;
    }

    .configure {
        position: fixed;
        left: 0;
        bottom: 0;
        padding: 16px 16px;
        background-color: #161616;
        border-top-right-radius: 4px;
        border-top: 2px solid white;
        border-right: 2px solid white;
        opacity: 0;
        cursor: pointer;

        &:hover {
            opacity: 1;
        }
    }

    .error {
        color: red;
        font-weight: bold;
    }

    .warning {
        padding: 16px;
        margin-bottom: 16px;
        background: #C62828;
        line-height: 1.5;
        color: #fff;
        border-radius: 2px;

        a {
            color: #fff;
        }

        h2 {
            margin: 0 0 8px 0;
        }
    }
}
</style>
