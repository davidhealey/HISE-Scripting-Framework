/*
    Copyright 2019 David Healey

    This file is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This file is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with This file. If not, see <http://www.gnu.org/licenses/>.
*/

Content.setWidth(730);
Content.setHeight(50);

reg ids = Engine.createMidiList();
reg held = Engine.createMidiList();
reg lastLevel = 0;

//GUI
const var btnBypass = Content.addButton("btnBypass", 10, 10);
btnBypass.set("text", "Bypass");

const var knbLevel = Content.addKnob("knbLevel", 160, 0);
knbLevel.set("text", "Level");
knbLevel.setRange(0, 127, 1);
knbLevel.setControlCallback(onknbLevelControl);

const var knbThreshold = Content.addKnob("knbThreshold", 310, 0);
knbThreshold.set("text", "Threshold");
knbThreshold.set("defaultValue", 10);
knbThreshold.setRange(0, 127, 1);

inline function getVelocity()
{
    local timeDiff = Math.min(1, Engine.getUptime()-lastTime) / 1; //Limit timeDiff to 0-1
    local v = Math.pow(timeDiff, 0.2); //Skew values
    velocity = parseInt(127-(v*117));

    lastTime = 0;
}

inline function onknbLevelControl(component, value)
{Console.print(held.getValueAmount(true));
    if (!btnBypass.getValue())
    {
        local threshold = knbThreshold.getValue();
        
        //Going up and reached threshold
        if (value >= threshold && lastLevel < threshold && held.getValueAmount(true))
        {            
            for (i = 0; i < 127; i++)
            {
                if (ids.getValue(i) != -1)
                    Synth.noteOffByEventId(ids.getValue(i));
                
                //Play new note                
                ids.setValue(i, Synth.playNote(i, 64));                
            }
        }
        else if (value < threshold && held.getValueAmount(true))
        {
            Engine.allNotesOff();
            ids.clear();
        }
                    
        lastLevel = value;        
    }
};

//Breath controller handler;
inline function breathTrigger(control, value)
{    
    if (!btnMute.getValue() && btnBc.getValue())
    {
        //Going up and reached the threshold
        if (value >= threshold && lastBreathValue < threshold && note != -1)
        {
            //Turn off old note
            if (eventId != -1) Synth.noteOffByEventId(eventId);

            //Play new note
            eventId = Synth.playNoteWithStartOffset(channel, note, velocity, 0);
            Synth.addPitchFade(eventId, 0, coarseDetune, fineDetune);  //Add any detuning
        }
        else if (value < threshold && eventId != -1)
        {
            Synth.noteOffByEventId(eventId);
            eventId = -1;
        }

        lastBreathValue = value;
    }
}


function onNoteOn()
{        
    if (btnBypass.getValue() || knbLevel.getValue() < knbThreshold.getValue())
        Message.ignoreEvent(true);
    else
        ids.setValue(Message.getNoteNumber(), Message.makeArtificial());
    
    held.setValue(Message.getNoteNumber(), true);
}function onNoteOff()
{
    local note = Message.getNoteNumber();
    held.setValue(note, -1);    
    
    if (ids.getValue(note) != -1)
    {
        Engine.allNotesOff();
        ids.clear();
    }    
}
function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}