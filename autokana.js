var AutoKana = function() {  
  function newHandler(options) {
    var pattern = options.pattern || /[\u3041-\u3094]/
    var source = options.input 
    var target = options.output 

    var previous = source.get() 

    var checkpoints = []
    
    function addCheckpoint(s, t) {
      checkpoints.push({
        source: s || '',
        target: t || '',
      })
    }

    
    function transcript(furigana, previous, current) {
      if (previous === current) {
        return furigana 
      }

      function grow(newFurigana) {
        addCheckpoint(current, newFurigana)
        return newFurigana
      }

      var common = 0
      for (var m = Math.max(previous.length, current.length), i = 0; i < m; i++) {
        if (previous.charAt(i) !== current.charAt(i)) {
          break 
        }
        common++
      }
  
      var removed = previous.substring(common)
      var appended = current.substring(common)
  
      if (removed.length === 1 && appended.length === 1
        && removed.match(pattern) && appended.match(pattern)) {
        // mobile style input method swaps the last letter
        return grow(furigana.substring(0, furigana.length - 1) + appended)
      }

      if (appended.length === 0) {
        // backspace
        for (var i = checkpoints.length; i > 0; i--) {
          var cp = checkpoints[i - 1]
          
          if (cp.source === current) {
            if (furigana.startsWith(cp.target)) {
              furigana = cp.target
              break
            }
          }
        }

        // shrink checkpoints 
        checkpoints = checkpoints.filter(function(cp) {
          return current.startsWith(cp.source)
        })

        return furigana 
      }
  
      for (var i = 0; i < appended.length; i++) {
        var letter = appended.charAt(i)
        if (letter.match(pattern)) {
          furigana += letter 
        } else {
          break 
        }
      }
  
      return grow(furigana)
    }

    addCheckpoint(source.get(), target.get())

    return function() {
      var current = source.get()

      // console.log(`"${previous}" => "${current}" / "${target.get()}"`, checkpoints)

      var furigana = transcript(target.get(), previous, current)

      previous = current 

      target.set(furigana)
    }
  }

  function ofInputElement(el) {
    return {
      get: function() {
        return el.value
      },
      set: function(newValue) {
        el.value = newValue 
      },
      subscribe: function(callback) {
        el.addEventListener('input', delayedForIOS(callback))
      },
    }
  }

  function delayedForIOS(callback) {    
    var timeoutId = null 
    return function() {
      // Safari's IME emits wrong event when transform
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      timeoutId = setTimeout(callback, 50)
    }
  }

  function subscribe(options) {
    // var source = ofInputElement(sourceEl)
    var handle = newHandler(options)
    options.input.subscribe(handle)
  }

  function kata2Hira(src) {
    return src.replace(/[\u30a1-\u30f6]/g, function(match) {
      var chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });
  }
  
  function hira2Kata(src) {
    return src.replace(/[\u3041-\u3096]/g, function(match) {
      var chr = match.charCodeAt(0) + 0x60;
      return String.fromCharCode(chr);
    });
  }

  return {
    newHandler: newHandler,
    subscribe: subscribe,
    ofInputElement: ofInputElement,
    kata2Hira: kata2Hira,
    hira2Kata: hira2Kata,
    delayedForIOS: delayedForIOS,
  }
}()