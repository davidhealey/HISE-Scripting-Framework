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
    along with this file. If not, see <http://www.gnu.org/licenses/>.
*/

reg currentNote; //The note that is currently pressed
reg lastNote = -1; //The last note that was pressed
reg retriggerNote = -1;
reg eventId;function onNoteOn()
{
    currentNote = Message.getNoteNumber();

	if (Synth.isLegatoInterval() && !Synth.isSustainPedalDown() && Engine.getNumVoices() > 0)
    {
        Message.setNoteNumber(lastNote);
        Message.setVelocity(Math.randInt(1, 6));
        retriggerNote = lastNote;
    }
    else
    {
        Message.ignoreEvent(true);
        retriggerNote = -1;
    }

    lastNote = currentNote;
}function onNoteOff()
{
    if (Message.getNoteNumber() == retriggerNote)
    {
        retriggerNote = -1;
    }

    if (Message.getNoteNumber() == lastNote && retriggerNote != -1 && Engine.getNumVoices() > 0)
    {
        eventId = Synth.playNote(lastNote, Math.randInt(1, 6));
        Synth.addPitchFade(eventId, 0, Message.getCoarseDetune(), Message.getFineDetune());

        lastNote = retriggerNote;
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
  
