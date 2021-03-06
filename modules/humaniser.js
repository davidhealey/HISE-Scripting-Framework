/*
    Copyright 2018, 2019 David Healey

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

Content.setWidth(600);
Content.setHeight(100);

reg gain;
reg pitch;
reg velocity;
reg offset;

const var noteOnDelays = Engine.createMidiList();
noteOnDelays.fill(0);

const knbGain = Content.addKnob("knbGain", 0, 0);
knbGain.set("text", "Gain");
knbGain.setRange(0, 6, 1);
knbGain.set("suffix", "dB");

const knbPitch = Content.addKnob("knbPitch", 150, 0);
knbPitch.set("text", "Pitch");
knbPitch.setRange(0, 50, 1);
knbPitch.set("suffix", "ct");

const knbVel = Content.addKnob("knbVel", 300, 0);
knbVel.set("text", "Velocity");
knbVel.setRange(0, 25, 1);

const knbOffset = Content.addKnob("knbOffset", 450, 0);
knbOffset.set("text", "Offset");
knbOffset.setRange(0, 500, 1);
knbOffset.set("suffix", "ms");

const knbNoteOn = Content.addKnob("knbNoteOn", 0, 50);
knbNoteOn.set("text", "Note On");
knbNoteOn.setRange(0, 100, 1);
knbNoteOn.set("suffix", "ms");

const knbNoteOff = Content.addKnob("knbNoteOff", 150, 50);
knbNoteOff.set("text", "Note Off");
knbNoteOff.setRange(0, 100, 1);
knbNoteOff.set("suffix", "ms");

function onNoteOn()
{
  gain = 0;
  pitch = 0;
  velocity = 0;
  offset = 0;

  //Generate random values
  if (knbGain.getValue() != 0) gain = Math.randInt(-knbGain.getValue(), knbGain.getValue()+1); //Gain
  if (knbPitch.getValue() != 0) pitch = Math.randInt(-knbPitch.getValue(), knbPitch.getValue()+1); //Pitch
  if (knbVel.getValue != 0) velocity = Math.randInt(-knbVel.getValue(), knbVel.getValue()+1); //Velocity
  if (knbOffset.getValue() != 0) offset = Engine.getSamplesForMilliSeconds(Math.random()*knbOffset.getValue()); //Start offset

  Message.setGain(Message.getGain() + gain);
  Message.setFineDetune(Message.getFineDetune() + pitch);
  Message.setVelocity(Math.range(Message.getVelocity() + velocity, 1, 127);
  Message.setStartOffset(offset);

	//Note on delay
	if (knbNoteOn.getValue() > 0)
	{
		noteOnDelays.setValue(Message.getNoteNumber(), Math.random() * knbNoteOn.getValue());
		Message.delayEvent(Engine.getSamplesForMilliSeconds(noteOnDelays.getValue(Message.getNoteNumber())));
	}
}
function onNoteOff()
{
    Message.setGain(Message.getGain() + gain);
    Message.setFineDetune(Message.getFineDetune() + pitch);
    Message.setVelocity(Math.range(Message.getVelocity() + velocity, 1, 127);
    Message.setStartOffset(offset);

    //Note delay
    if (knbNoteOn.getValue() != 0 || knbNoteOff.getValue() != 0)
    {
        local delay = 0; //Reset

        //Compensate for note on delay
        if (knbNoteOn.getValue() != 0)
        {
            delay = noteOnDelays.getValue(Message.getNoteNumber());
        }

        //Note Off
        if (knbNoteOff.getValue() > 0)
        {
            delay += Math.random() * knbNoteOff.getValue(); //Note off delay
        }

        Message.delayEvent(Engine.getSamplesForMilliSeconds(delay));
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
