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
    along with this file. If not, see <http://www.gnu.org/licenses/>.
*/

Content.setWidth(650);
Content.setHeight(200);

const var tblVelocity = Content.addTable("tblVelocity", 25, 25);
tblVelocity.set("width", 600);
tblVelocity.set("height", 150);function onNoteOn()
{
    Message.setVelocity(Math.max(1, 127/100 * tblVelocity.getTableValue(Message.getVelocity()) * 100)); //Scale velocity using table
}
function onNoteOff()
{

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
