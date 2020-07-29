/*
MIT License

Copyright 2019 David Healey

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
const var knbTransposition = Content.addKnob("Transposition", 0, 0);
knbTransposition.setRange(-12, 12, 1);
knbTransposition.set("text", "Transposition");
knbTransposition.set("defaultValue", 0);
knbTransposition.set("middlePosition", 0);
function onNoteOn()
{
	if (knbTransposition.getValue() != 0)
        Message.setTransposeAmount(knbTransposition.getValue());
}function onNoteOff()
{
	if (knbTransposition.getValue() != 0)
        Message.setTransposeAmount(knbTransposition.getValue());
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
