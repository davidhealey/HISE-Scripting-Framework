/*
    Copyright 2018 David Healey

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

reg lastChan = 0;
reg lastNote = -1;
reg lastEventId = -1;
reg retriggerNote = -1;
reg lastVelo = 0;
reg lastTime;
reg interval;
reg fadeTime;
reg bendTime;
reg bendAmount = 0;
reg bendLookup = []; //Bend amount lookup table - generated on init (onControl) and updated when bend amount changed

reg glideBend; //The bend amount for glides, either 100 or -100 depending on if an up or down glide
reg glideNote; //Currently sounding note during a glide
reg rate; //Timer rate for glide/trill
reg notes = []; //Origin and target notes for glide/trill
notes.reserve(2);
reg count; //Counter for switching between origin and target notes for trill

//Loop iterators
reg i;
reg j;

const var CHORD_THRESHOLD = 25; //If two notes are played within this many milliseconds then it's a chord

//GUI
Content.setWidth(700);
Content.setHeight(150);

const var btnBypass = Content.addButton("Sustain", 0, 10);
btnBypass.set("radioGroup", 1);

const var btnLegato = Content.addButton("Legato", 150, 10);
btnLegato.set("radioGroup", 1);

const var btnGlide = Content.addButton("Glide", 300, 10);
btnGlide.set("radioGroup", 1);

const var btnWholeStep = Content.addButton("Whole Step Glide", 450, 10);
btnWholeStep.set("tooltip", "When active each step of a glide will be a whole tone rather than chromatic.");

const var knbBendTm = Content.addKnob("Bend Time", 0, 50);
knbBendTm.setRange(-50, 50, 0.1);
knbBendTm.set("suffix", "ms");
knbBendTm.set("tooltip", "The pitch bend lasts the same duration as the crossfade time by default but can be adjusted with this knob. If the bend time ends up being less than 0 it will automatically (behind the scenes) be set to 10ms.");

const var knbMinBend = Content.addKnob("Min Bend", 150, 50);
knbMinBend.setRange(0, 100, 1);
knbMinBend.set("suffix", "ct");
knbMinBend.set("tooltip", "The amount of pitch bend in cents (ct) for an interval of 1 semitone");

const var knbMaxBend = Content.addKnob("Max Bend", 300, 50);
knbMaxBend.setRange(0, 100, 1);
knbMaxBend.set("suffix", "ct");
knbMaxBend.set("tooltip", "The amount of pitch bend in cents (ct) for an interval of 12 semitones");

const var knbFadeTm = Content.addKnob("Fade Time", 450, 50);
knbFadeTm.setRange(10, 500, 0.1);
knbFadeTm.set("suffix", "ms");
knbFadeTm.set("tooltip", "Maximum crossfade time in milliseconds, the actual time used will vary based on playing speed and velocity.");

const knbFadeOutRatio = Content.addKnob("Fade Out Ratio", 600, 50);
knbFadeOutRatio.setRange(0, 100, 1);
knbFadeOutRatio.set("defaultValue", 100);
knbFadeOutRatio.set("text", "Fade Out Ratio");
knbFadeOutRatio.set("suffix", "%");
knbFadeOutRatio.set("tooltip", "Shortens the fade out time to a percentage of the fade time. 100% = the same as fade in time.");

const var knbOffset = Content.addKnob("Offset", 0, 100);
knbOffset.setRange(0, 1000, 0.1);
knbOffset.set("tooltip", "Sets the startMod constant modulator (required) for legato phrase and glide notes.");

const var knbRate = Content.addKnob("Glide Rate", 150, 100);
knbRate.set("mode", "TempoSync");
knbRate.set("max", 19);
knbRate.set("tooltip", "Rate for glide timer relative to current tempo. If velocity is selected then the glide time will be based on the played velocity.");

const var btnSameNote = Content.addButton("Same Note Legato", 300, 110);
btnSameNote.set("tooltip", "When active releasing a note in normal legato mode will retrigger the note that was released with a transition.");

const var btnKillOld = Content.addButton("Kill Old Notes", 450, 110);
btnKillOld.set("tooltip", "If enabled old notes will be turned off, triggering releases, rather than faded out. Use an evelope to control the fade out time when enabled.");

//FUNCTIONS

/**
 * A lookup table is used for pitch bending to save CPU. This function fills that lookup table based on the min bend and max bend values.
 * @param  {number} minBend The amount of bend for an interval of 1 semitone
 * @param  {number} maxBend The amount of bend for an interval of 12 semitones
  */
inline function updateBendLookupTable(minBend, maxBend)
{
	for (i = 0; i < 12; i++) //Each semitone
	{
		bendLookup[i] = ((i + 1) * (maxBend - minBend)) / 12 + minBend;
	}
}

/**
 * The fade time to be used when crossfading legato notes
 * @param  {number} interval Distance between the two notes that will be crossfaded
 * @param  {number} velocity Velocity of the note that will be faded in, a higher velocity = shorter fade time
 * @return {number}          Crossfade time in ms
 */
inline function getFadeTime(interval, velocity)
{
	local timeDif = (Engine.getUptime() - lastTime) * 1000; //Get time difference between now and last note
	local fadeTime = timeDif; //Default fade time is played time difference

	if (timeDif <= knbFadeTm.getValue() * 0.5) fadeTime = knbFadeTm.getValue() * 0.5; //Fade time minimum is 50% of knbFadeTm.getValue() - when playing fast
	if (timeDif >= knbFadeTm.getValue()) fadeTime = knbFadeTm.getValue();

	fadeTime = fadeTime + (interval * 2); //Adjust the fade time based on the interval size

	if (velocity > 64) fadeTime = fadeTime - (fadeTime * 0.2); //If a harder velocity is played reduce the fade time by 20%

	return fadeTime;
}

/**
 * Returns the timer rate for glides
 * @param  {number} interval [The distance between the two notes that will be glided]
 * @param  {number} velocity [A velocity value for velocity based glide rates]
 * @return {number}          [Timer rate]
 */
inline function getRate(interval, velocity)
{
	local rate = knbRate.getValue(); //Get rate knob value
	local invl = interval;

	//If rate knob is set to the maximum then the actual rate will be determined by velocity
	if (rate == knbRate.get("max"))
	{
		rate = Math.min(knbRate.get("max")-1, Math.floor((velocity / (knbRate.get("max") - 1)))); //Capped rate at max rate
		invl = interval + 3; //Increase interval to improve velocity controlled resolution
	}

	rate = Engine.getMilliSecondsForTempo(rate) / 1000; //Rate to milliseconds for timer

	rate = Math.max(0.04, rate / invl); //Rate is per glide step - capped at timer's min

	return rate;
}

/**
* Simple helper function to turn off the last recorded note and reset its related variables
*/
inline function turnOffLastNote()
{
    Synth.noteOffByEventId(lastEventId);
    lastEventId = -1;
    lastNote = -1;
}

/**
* For switching between the three modes (sustain, legato, glide) internally
* and making sure each button is set to the correct value.
*/
inline function changeMode(mode)
{
    btnLegato.setValue(0);
    btnGlide.setValue(0);
    btnBypass.setValue(0);

    if (mode == 0) btnBypass.setValue(1); //Sustain
    if (mode == 1) btnLegato.setValue(1); //Legato
    if (mode == 2) btnGlide.setValue(1); //Glide
} 
