var AutoKana = function(options) {
  options = options || { }

  var pattern = options.pattern || /[\u3041-\u3094]/
  
  function transcript(furigana, previous, current) {
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
      return furigana.substring(0, furigana.length - 1) + appended
    }

    for (var i = 0; i < appended.length; i++) {
      var letter = appended.charAt(i)
      if (letter.match(pattern)) {
        furigana += letter 
      } else {
        break 
      }
    }

    return furigana 
  }

  function newHandler(source, target) {
    var previous = source.get() 

    return function() {
      var current = source.get()
      // console.log(previous, ' => ', current)

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
      }
    }
  }

  function subscribe(sourceEl, targetEl) {
    var handle = newHandler(ofInputElement(sourceEl), ofInputElement(targetEl))
    sourceEl.addEventListener('keyup', function() {
      handle()
    })
  }

  return {
    newHandler: newHandler,
    subscribe: subscribe,
  }
}