/*
  This file is part of the Ofi Labs X2 project.

  Copyright (C) 2010 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

KineticModel = function(min, max, handler)
{
    this.ticker = null;

    this.minimum = min;
    this.maximum = max;

    this.released = false;
    this.position = 0;
    this.velocity = 0;
    this.maximumSpeed = 1981;
    this.deacceleration = 400;

    this.timestamp = Date.now();
    this.lastPosition = 0;
    this.updateInterval = 15;

    this.callback = handler;
}

KineticModel.prototype.setPosition = function(pos)
{
    this.released = false;
    if (pos === this.position)
        return;

    this.position = pos;
    this.position = Math.min(this.position, this.maximum);
    this.position = Math.max(this.position, this.minimum);

    this.callback(this.position);
    this.update(this);
    this.triggerUpdate(this.update);
}

KineticModel.prototype.triggerUpdate = function(f)
{
    if (this.ticker === null) {
        var self = this;
        this.ticker = window.setInterval(function() { f(self); } , this.updateInterval);
    }
}

KineticModel.prototype.resetSpeed = function()
{
    this.velocity = 0;
    this.lastPosition = this.position;
}

KineticModel.prototype.release = function()
{
    this.released = true;

    this.velocity = Math.min(this.velocity, this.maximumSpeed);
    this.velocity = Math.max(this.velocity, -this.maximumSpeed);

    this.triggerUpdate(this.update);
}

KineticModel.prototype.update = function(self)
{
    var elapsed = Date.now() -  self.timestamp;
    if (isNaN(elapsed) || elapsed < 5)
        return;

    self.timestamp = Date.now();
    var delta = elapsed / 1000;

    if (self.released) {
        self.position += (self.velocity * delta);
        self.position = Math.min(self.position, self.maximum);
        self.position = Math.max(self.position, self.minimum);
        var vstep = self.deacceleration * delta;
        if (self.velocity < vstep && self.velocity > -vstep) {
            self.velocity = 0;
            window.clearInterval(self.ticker);
            self.ticker = null;
        } else {
            if (self.velocity > 0)
               self.velocity -= vstep;
            else
                self.velocity += vstep;
        }
        self.callback(self.position);
    } else {
        var lastSpeed = self.velocity;
        var currentSpeed = (self.position - self.lastPosition) / delta;
        self.velocity = .23 * lastSpeed + .77 * currentSpeed;
        self.lastPosition = self.position;
    }
}
