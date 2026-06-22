// ---- ---- ---- ---- grab objects from structure

function POwO_docgetel(InName)
{
    return document.getElementById(InName)
}

const mainButton = POwO_docgetel("mainButton");

const field_met_text = POwO_docgetel("field_metronome_text")

const field_met_interval = POwO_docgetel("field_metronome_interval")
const field_met_timePrint = POwO_docgetel("field_metronome_timePrint")
const field_met_pos_full = POwO_docgetel("field_metronome_pos_full")

const field_met_playPause = POwO_docgetel("field_metronome_playPause")

const field_met_recordSize = POwO_docgetel("field_metronome_RecordSize")
const field_met_recordPrint = POwO_docgetel("field_metronome_recordList")



// ---- ---- ---- ---- prepare global objects

var GLOBAL_colorON = "1"
var GLOBAL_colorOFF = "0.5"

var GLOBAL_met_interval_cur = 0
var GLOBAL_met_interval_full = 200
var GLOBAL_met_pos_cur = 0
var GLOBAL_met_pos_full = 4
var GLOBAL_met_javascriptInterval;

var GLOBAL_aud_buffer_stone;
var GLOBAL_aud_nodePointer;

var GLOBAL_performance_pinA = performance.now();
var GLOBAL_performance_pinB = performance.now();

var GLOBAL_record_size = 8;
var GLOBAL_record_list = []
var GLOBAL_record_lastTime = performance.now()


// ---- ---- ---- ---- ON START

const adkt = new (window.AudioContext || window.webkitAudioContext)();
console.log("new audioKontext");

const List_URL = ['kick_stone.ogg','kick_basic.wav'];

const List_AudioBuffers = [];



//---- ---- ---- ---- POwO Functions : Audio

async function POwO_LoadSounds()
{
    //convert a sound file to a audioBuffer, so that the audioContext can play it
    for(let i = 0 ; i < List_URL.length ; i++)
    {
        let tempResponse = await fetch(List_URL[i])
        let tempArrayBuff = await tempResponse.arrayBuffer()
        let tempAudioBuff = await adkt.decodeAudioData(tempArrayBuff)
        List_AudioBuffers.push( tempAudioBuff )
    }

    console.log("load sounds complete OwO")
}
POwO_LoadSounds()
//will run on START
//at this point, List_AudioBuffers will have the audioBuffers


function POwO_playSound(inIndex)
{
    let tempNode = adkt.createBufferSource();
    tempNode.buffer = List_AudioBuffers[inIndex]
    tempNode.connect(adkt.destination);
    tempNode.start();

    mainButton.style.opacity = GLOBAL_colorON
    POwO_RandomCircle(100,500 , 500,0,0,500 , 230,255 , 128,230 , 0,64);

    tempNode.onended = ()=>{ tempNode.disconnect(); tempNode.onended = null; }
}

function POwO_StopSound(InComingKey)
{
    mainButton.style.opacity = GLOBAL_colorOFF
}

function POwO_metronome_config()
{
    GLOBAL_met_interval_full = Number(field_met_interval.value)
    GLOBAL_met_pos_cur = 0
    GLOBAL_met_pos_full = Number(field_met_pos_full.value)
}

function POwO_metronome_playPause()
{
    if (field_met_playPause.innerText === "play")
    {
        POwO_metronome_config()
        GLOBAL_performance_pinA = performance.now()
        GLOBAL_performance_pinB = performance.now()
        GLOBAL_met_pos_cur = GLOBAL_met_pos_full - 1;
        GLOBAL_met_interval_cur = 0;
        GLOBAL_met_javascriptInterval = setInterval(() =>
        {
            //what is deltaTime ?
            GLOBAL_performance_pinA = GLOBAL_performance_pinB
            GLOBAL_performance_pinB = performance.now()
            let temp_deltaTime = GLOBAL_performance_pinB - GLOBAL_performance_pinA

            //play sound and light button
            if ( GLOBAL_met_interval_cur < GLOBAL_met_interval_full)
            {
                GLOBAL_met_interval_cur += temp_deltaTime
            }
            else
            {
                while(GLOBAL_met_interval_cur >= GLOBAL_met_interval_full)
                {
                    GLOBAL_met_interval_cur -= GLOBAL_met_interval_full
                    POwO_playSound(0)

                    if (GLOBAL_met_pos_cur < GLOBAL_met_pos_full - 1)
                    {
                        GLOBAL_met_pos_cur++
                    }
                    else
                    {
                        GLOBAL_met_pos_cur = 0
                        POwO_playSound(1)
                    }
                }
            }

            //print text
            field_met_timePrint.innerText = GLOBAL_met_interval_cur + " / " + GLOBAL_met_pos_cur

            //dim button
            if (mainButton.style.opacity > GLOBAL_colorOFF){ mainButton.style.opacity -= 0.01 }

        }, 1);

        field_met_playPause.innerText = "pause"
    }
    else
    {
        clearInterval( GLOBAL_met_javascriptInterval )
        field_met_playPause.innerText = "play"
        for(let i = 0 ; i < List_Recs.length ; i++)
        {
            List_Recs[i].style.opacity = GLOBAL_colorOFF //turn off the LED
        }
    }
    
}

function POwO_metronome_RecordSetSize()
{
    GLOBAL_record_size = Number(field_met_recordSize.value)
}

function POwO_metronome_RecordPulse()
{
    GLOBAL_record_list.push( performance.now() - GLOBAL_record_lastTime )
    GLOBAL_record_lastTime = performance.now()
    while (GLOBAL_record_list.length > GLOBAL_record_size)
    {
        GLOBAL_record_list.shift()
    }

    POwO_metronome_RecordBPMCal()
}

function POwO_metronome_RecordClear()
{
    GLOBAL_record_list = []
    POwO_metronome_RecordBPMCal()
}

function POwO_metronome_RecordPop()
{
    if (GLOBAL_record_list.length > 0)
    {
        GLOBAL_record_list.pop()
    }

    POwO_metronome_RecordBPMCal()
}

function POwO_metronome_RecordBPMCal()
{
    if (GLOBAL_record_list.length > 0)
    {
        field_met_recordPrint.textContent = ""
        let tempSum = 0
        for( let i = 0 ; i < GLOBAL_record_list.length ; i++ )
        {
            tempSum += GLOBAL_record_list[i]
            field_met_recordPrint.textContent += "(" + i + ") : " + GLOBAL_record_list[i].toFixed(2) + "\n"
        }

        let tempAvg = tempSum / GLOBAL_record_list.length

        let temp_HTML_bpm = document.createElement("div")
        temp_HTML_bpm.style.fontSize = "48px"
        temp_HTML_bpm.textContent = Number(60000 / tempAvg).toFixed(2) + " bpm"

        let temp_HTML_ms = document.createElement("div")
        temp_HTML_ms.style.fontSize = "25px"
        temp_HTML_ms.textContent = tempAvg.toFixed(2) + " ms"

        mainButton.replaceChildren()
        mainButton.appendChild(temp_HTML_bpm)
        mainButton.appendChild(temp_HTML_ms)

    }
    else
    {
        field_met_recordPrint.textContent = ""
    }
}





// ---- ---- ---- ---- POwO Functions : visual

function POwO_RandomCircle
(
    InRadiusMin, InRadiusMax,
    InMarginR , InMarginU, InMarginL, InMarginD,
    InColorRmin, InColorRmax, InColorGmin, InColorGmax, InColorBmin, InColorBmax
)
{
    
    // Create a new circle element
    const circle = document.createElement('div');
    circle.classList.add('circle');

    // Set random size
    const size = Math.random() * (InRadiusMax - InRadiusMin) + InRadiusMin; // Random size between 10px and 60px
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;

    // Set random position
    const x = Math.random() * (window.innerWidth - InMarginR - InMarginL ) + InMarginL ;
    const y = Math.random() * (window.innerHeight - InMarginD - InMarginU) + InMarginU ;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;

    // Set random color
    const r = Math.floor(Math.random() * (InColorRmax - InColorRmin) + InColorRmin);
    const g = Math.floor(Math.random() * (InColorGmax - InColorGmin) + InColorGmin);
    const b = Math.floor(Math.random() * (InColorBmax - InColorBmin) + InColorBmin);
    circle.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.8)`;

    // Append the circle to the body
    document.body.appendChild(circle);

    // Remove the circle after the fade-out animation ends
    setTimeout(() => {
        circle.remove();
    }, 2000); // Match the duration of the fadeOut animation (2s)
}





document.addEventListener('keydown', (event) => {
    if (event.key = "Enter")
    {
        POwO_metronome_RecordPulse()
        POwO_playSound(0)
    }

});