import WSClient from "./ws-client";
import Selectable from "./components/selectable";
import Tabbed from "./components/tabbed";
import Console from "./components/console";
import { randomString } from "./utils";

const MIN_CHANNEL_LEN = 1;

// basic page UI
Array.from(document.getElementsByClassName("code")).forEach($node => {
    new Selectable($node as HTMLElement);
});
Array.from(document.getElementsByClassName("tabbed")).forEach($node => {
    new Tabbed($node as HTMLElement);
});
let curChannel = location.hash.length > MIN_CHANNEL_LEN + 1 ? location.hash.substr(1) : randomString(8);
const $channelInp = document.querySelector(".channel-inp") as HTMLInputElement;
$channelInp.value = curChannel;
$channelInp.addEventListener("blur", () => {
    if ($channelInp.value.length > MIN_CHANNEL_LEN && $channelInp.value !== curChannel) {
        client.close();
        curChannel = $channelInp.value;
        attachClient($channelInp.value);
    }
});

// start the WS client
let client: WSClient;
let console: Console;
function attachClient(channel: string) {
    client = new WSClient(channel);
    client.on("connect", () => {
        Array.from(document.getElementsByClassName("channel")).forEach($node => {
            $node.textContent = channel;
        });
        history.replaceState("", "", "#"+channel);
        (document.querySelector(".prompt-content") as Element).textContent = "Awaiting logs...";
    });

    if (console) { console.destroy(); }
    console = new Console(document.querySelector(".console") as HTMLElement, client);
}
attachClient(curChannel);
