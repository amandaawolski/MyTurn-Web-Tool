(function($) {
  $(document).ready(function() {
    var db = new Dexie("myturn");
    db.version(1).stores({
      steps: "id, annot, pseudo, blocks, img"
    });
    var count = 0;
    var scrolledDistance = 0;
    var blocks = [{
      'name': 'Does ClicBot do something multiple times?',
      'items': ['loop.png', 'loop-until.png', 'while-do.png', 'loop-for-times.png']
    },
    {
      'name': 'Does ClicBot wait to do something??',
      'items': ['if-do.png', 'delay-for-ms.png', 'delay-until.png']
    },
    {
      'name': 'Does ClicBot make sound?',
      'items': ['play.png', 'play-end.png', 'start-play.png', 'start-play-end.png']
    },
    {
      'name': 'Does ClicBot display an emotion or a drawing?',
      'items': ['screen-starts-playing-emotion.png', 'screen-starts-playing-emotion-till-the-end.png', 'screen-displays-drawing.png']
    },
    {
      'name': 'Does ClicBot rotate its screen?',
      'items': ['rotate.png', 'rotate-end.png']
    },
    {
      'name': 'Does ClicBot rotate or move?',
      'items': ['joint-rotate.png', 'joint-rotate-end.png', 'joint-rotate-speed.png', 'wheel-rotate.png']
    },
    {
      'name': 'Does ClicBot change colors?',
      'items': ['skeleton-color.png']
    },
    {
      'name': 'Does ClicBot grasp or release something?',
      'items': ['grasper.png']
    },
    {
      'name': 'Does ClicBot use one of its sensors?',
      'items': ['gesture.png', 'gesture-obs.png', 'touch.png', 'touch-brain.png', 'distance.png']
    },
    {
      'name': 'Operators',
      'items': ['and.png', 'or.png', 'not.png', 'empty.png']
    }
    ];
    init();
    $(document).on('click', '#home .main-btn', function() {
      $('body').attr('data-section', 2);
    });
    $(document).on('click', '#pre-upload .main-btn', function() {
      db.steps.count(function(scount) {
        if (scount > 0) {
          $('#upload .upload-item').remove();
          $('#upload .uploads').attr('data-available', 1);
          db.steps.each(function(step) {
            $('#upload .uploads').append(`
	        				<div class="upload-item" data-annot="` + step.annot + `" data-pseudo="` + step.pseudo + `">
	        					<img src="` + step.img[0] + `">
								<div>
								    <button class="secondary-btn clear-btn">Clear Image</button>
								    <button class="secondary-btn next-frame-btn">Upload another</button>
								</div>
								<div class="makeshift-blocks">` + step.blocks + `</div>
							</div>
	        			`);
          });
        }
      });
      $('body').attr('data-section', 3);
    });
    $(document).on('click', '#upload .next-frame-btn', function() {
      var cloned = `
            <div class="upload-item" data-annot="" data-pseudo="">
	            <input type="file" class="upload-frame" accept="image/*"">
	            <div>
	            	<button class="secondary-btn clear-btn">Clear Image</button>
	            	<button class="secondary-btn next-frame-btn">Upload another</button>
	            </div>
	            <div class="makeshift-blocks"></div>
	        </div>`;
      $(this).parents('.upload-item').after(cloned);
    });
    $(document).on('change', '.upload-frame', function() {
      var $this = $(this);
      var promise = getBase64($this.get(0).files[0]);
      promise.then(function(result) {
        $this.parents('.upload-item').prepend('<img src="' + result + '">');
        $this.parents('.upload-item').children('input').remove();
      });
    });
    $(document).on('click', '#upload .clear-btn', function() {
      $(this).parents('.upload-item').children('img, input').remove();
      $(this).parents('.upload-item').prepend('<input type="file" class="upload-frame" accept="image/*">');
    });
    $(document).on('click', '.finish-upload-btn', function() {
      var flag = true;
      if ($('#upload .uploads').attr('data-available') == 1) {
        flag = false;
      }
      if ($('.upload-item > img').length) {
        $('#annotate .row').remove();
        $.each($('.upload-item > img'), function(i, v) {
          if (flag) {
            db.steps.put({
              img: [$(v).attr('src')],
              annot: '',
              pseudo: '',
              blocks: '',
              id: i
            });
          } else {
            db.steps.update(i, {
              img: [$(v).attr('src')]
            });
          }
          $('#annotate').append(`
        				<div class="row" data-pseudo="` + $(v).parents('.upload-item').attr('data-pseudo') + `" data-id="` + i + `">
				            <div>
				                <div>
				                    <p>Frame:</p>
				                    <span class="edit-frame">Edit</span>
				                    <img src="` + $(v).attr('src') + `">
				                </div>
				                <button class="remove-frame">Remove frame</button>
				                <button class="add-frame">Add another</button>
				            </div>
				            <div>
				                <p>Annotations:</p>
				                <textarea data-text="` + $(v).parents('.upload-item').attr('data-annot') + `" class="annot-texts">` + $(v).parents('.upload-item').attr('data-annot') + `</textarea>
				            </div>
				            <div class="makeshift-blocks">` + $(v).parents('.upload-item').find('.makeshift-blocks').text() + `</div>
				        </div>
        			`);
        });
        $('body').attr('data-section', 4);
      }
    });
    $(document).on('click', '.annotate-next-btn', function() {
      if ($('#annotate .row img').length) {
        db.steps.clear();
        $('#pseudocode .row').remove();
        $.each($('#annotate .row img'), function(i, v) {
          db.steps.put({
            img: [$(v).attr('src')],
            annot: $(v).parents('.row').find('.annot-texts').attr('data-text'),
            pseudo: $(v).parents('.row').attr('data-pseudo'),
            blocks: $(v).parents('.row').find('.makeshift-blocks').text(),
            id: i
          });
          $('#pseudocode').append(`
				        <div class="row" data-id="` + i + `">
				            <div>
				                <div>
				                    <p>Frame:</p>
				                    <img src="` + $(v).attr('src') + `">
				                </div>
				            </div>
				            <div>
				                <p>Annotations:</p>
				                <div class="textarea annot-texts">` + $(v).parents('.row').find('.annot-texts').attr('data-text') + `</div>
				            </div>
				            <div>
				                <p>Pseudocode:</p>
				                <textarea data-text="` + $(v).parents('.row').attr('data-pseudo') + `" class="pseudo-texts">` + $(v).parents('.row').attr('data-pseudo') + `</textarea>
				            </div>
				            <div class="makeshift-blocks">` + $(v).parents('.row').find('.makeshift-blocks').text() + `</div>
				        </div>
        			`);
        });
        $('body').attr('data-section', 5);
      }
    });
    $(document).on('click', '.pseudocode-back-btn, .edit-annots-btn', function() {
      $('body').attr('data-section', 4);
    });
    $(document).on('click', '.pseudocode-next-btn', function() {
      if ($('#pseudocode .row img').length) {
        $('#editor .annots-row').remove();
        $.each($('#pseudocode .row img'), function(i, v) {
          db.steps.update(i, {
            pseudo: $(v).parents('.row').find('.pseudo-texts').attr('data-text')
          });
          var blocks = $(v).parents('.row').find('.makeshift-blocks').text();
          if (blocks != '') {
            blocks = getBlocks(blocks);
          }
          $('#editor .annots').append(`
				        <div class="annots-row" data-id="` + i + `">
				            <div class="annots-meta">
			                    <p>Frame:</p>
			                    <img src="` + $(v).attr('src') + `">
				                <p>Pseudocode:</p>
				                <div class="textarea annot-texts">` + $(v).parents('.row').find('.annot-texts').text() + `</div>
				                <div class="textarea pseudo-texts">` + $(v).parents('.row').find('.pseudo-texts').attr('data-text') + `</div>
				            </div>
				            <div class="annots-editor">
			                    <p>Block Code:</p>
			                    <div class="drop-editor">` + blocks + `</div>
			                </div>
				        </div>
        			`);
        });
        $('body').attr('data-section', 6);
        setTimeout(function() {
          $('#editor').css('padding-bottom', (parseInt($('.blocks').outerHeight(), 10) + 30) + 'px');
        }, 100);
      }
    });
    $(document).on('click', '.editor-back-btn, .edit-pseudo-btn', function() {
      $('body').attr('data-section', 5);
    });
    $(document).on('click', '.editor-next-btn', function() {
      $('#summary .row').remove();
      $.each($('#editor .annots-row'), function(i, v) {
        $('#summary').append(`
			        <div class="row">
			            <div class="summary-img">
		                    <p>Frame:</p>
		                    <img src="` + $(v).find('.annots-meta > img').attr('src') + `">
			            </div>
			            <div class="summary-texts">
			                <p>Annotations:</p>
			                <div class="textarea">` + $(v).find('.annots-meta > .annot-texts').text() + `</div>
			                <p>Pseudocode:</p>
			                <div class="textarea">` + $(v).find('.annots-meta > .pseudo-texts').text() + `</div>
			            </div>
			            <div>` + $(v).find('.annots-editor').html() + `</div>
			        </div>
    			`);
      });
      $('#summary [draggable]').removeAttr('draggable');
      $('body').attr('data-section', 7);
    });
    $(document).on('click', '.edit-blocks-btn', function() {
      $('body').attr('data-section', 6);
    });
    $(document).on('click', '.start-over-btn', function() {
      $('body').attr('data-conf', 1);
    });
    $(document).on('click', '.conf-yes-btn', function() {
      db.steps.clear();
      location.reload();
    });
    $(document).on('click', '.conf-no-btn', function() {
      $('body').attr('data-conf', 0);
    });
    $(document).on('click', '#annotate .add-frame', function() {
      $(this).parents('.row').after(`
	       		<div class="row">
		            <div>
		                <div>
		                    <p>Frame:</p>
		                    <span class="edit-frame">Edit</span>
		                	<input type="file" class="update-frame" accept="image/*" "="">
		                </div>
		                <button class="remove-frame">Remove frame</button>
		                <button class="add-frame">Add another after</button>
		            </div>
		            <div>
		                <p>Annotations:</p>
		                <textarea data-text="" class="annot-texts"></textarea>
		            </div>
		            <div class="makeshift-blocks"></div>
		        </div>
       		`);
      annotInit();
    });
    $(document).on('click', '.edit-frame', function() {
      $(this).parent().children('img').remove();
      $(this).parent().append('<input type="file" class="update-frame" accept="image/*"">');
      $(document).find('.update-frame').click();
    });
    $(document).on('click', '.remove-frame', function() {
      $(this).parents('.row').remove();
      annotInit();
    });
    $(document).on('change', '.update-frame', function() {
      var $this = $(this);
      var promise = getBase64($this.get(0).files[0]);
      promise.then(function(result) {
        $this.parent().append('<img src="' + result + '">');
        $this.parent().children('input').remove();
      });
    });
    $(document).on('input', 'textarea', function() {
      $(this).attr('data-text', $(this).val());
      var id = Number($(this).parents('.row').attr('data-id').trim());
      if ($(this).hasClass('annot-texts')) {
        $('[data-annot]').attr('data-annot', $(this).val());
        db.steps.update(id, {
          annot: $(this).val()
        });
      }
      if ($(this).hasClass('pseudo-texts')) {
        $('[data-pseudo]').attr('data-pseudo', $(this).val());
        db.steps.update(id, {
          pseudo: $(this).val()
        });
      }
    });
    $(window).scroll(function() {
      scrolledDistance = parseInt($(window).scrollTop());
    });
    $(document).on('dragover', '#editor .drop-editor', function(e) {
      e.preventDefault();
    });
    $(document).on('dragstart', '.block-items img, .bi', function(e) {
      if ($(this).hasClass('bi')) {
        var srcTop = (e.originalEvent.clientY - $(this).parent().offset().top) + scrolledDistance;
        var srcLeft = e.originalEvent.clientX - $(this).parent().offset().left;
        var diffY = srcTop - parseInt($(this).css('top'), 10);
        var diffX = srcLeft - parseInt($(this).css('left'), 10);
        e.originalEvent.dataTransfer.setData("text/plain", diffY + '-' + diffX);
      }
      e.originalEvent.dataTransfer.setData("text/html", e.target.outerHTML);
    });
    $(document).on('drop', '#editor .drop-editor', function(e) {
      e.preventDefault();
      var diffX = 0;
      var diffY = 0;
      var elem = $.parseHTML(e.originalEvent.dataTransfer.getData("text/html"))[0];
      var posTop = (e.originalEvent.clientY - $(this).offset().top) + scrolledDistance;
      var posLeft = e.originalEvent.clientX - $(this).offset().left;
      if ($(elem).hasClass('bi')) {
        var id = $(elem).attr('id');
        diffY = e.originalEvent.dataTransfer.getData("text/plain").split('-')[0];
        diffX = e.originalEvent.dataTransfer.getData("text/plain").split('-')[1];
        $(document).find('.bi#' + id).css('top', posTop - diffY);
        $(document).find('.bi#' + id).css('left', posLeft - diffX);
      } else {
        $(this).append('<img id="b' + count + '" class="bi" style="top:' + posTop + 'px; left:' + posLeft + 'px;" draggable="true" src="' + $(elem).attr('src') + '">');
      }
      var blocks = [];
      $.each($(this).find('img'), function(i, v) {
        blocks.push({
          'src': $(v).attr('src'),
          'top': parseInt($(v).css('top'), 10),
          'left': parseInt($(v).css('left'), 10)
        });
      });
      $('.makeshift-blocks').text(JSON.stringify(blocks));
      db.steps.update(Number($(this).parents('.annots-row').attr('data-id').trim()), {
        blocks: JSON.stringify(blocks)
      });
      count++;
    });
    $(document).on('drop', 'textarea', function(e) {
      e.preventDefault();
    });

    $(document).on('click', '.blocks-group button', function() {
      $(this).parents('.blocks').attr('data-current', $(this).attr('data-id'));
      setTimeout(function() {
        $('#editor').css('padding-bottom', (parseInt($('.blocks').outerHeight(), 10) + 30) + 'px');
      }, 100);
    });

    $(document).on('click', '.close-glossary', function() {
      window.close();
    });

    function init() {
      $('.upload-frame').val('');
      $.each(blocks, function(i, v) {
        $('.blocks-group').append('<button data-id="' + i + '">' + v.name + '</button>');
        $.each(v.items, function(ci, cv) {
          $('.block-items').append('<img draggable="true" src="assets/images/' + cv + '" data-id="' + i + '">');
        });
      });
      setTimeout(function() {
        $('#editor').css('padding-bottom', (parseInt($('.blocks').outerHeight(), 10) + 30) + 'px');
      }, 100);
    }

    function annotInit() {
      db.steps.clear();
      $.each($('#annotate .row'), function(i, v) {
        $(this).attr('data-id', i);
        db.steps.put({
          img: [$(v).find('img').attr('src')],
          annot: $(v).find('.annot-texts').attr('data-text'),
          pseudo: $(v).attr('data-pseudo'),
          blocks: $(v).find('.makeshift-blocks').text(),
          id: i
        });
      });
    }

    function getBlocks(blocks) {
      blocks = JSON.parse(blocks);
      var html = '';
      $.each(blocks, function(i, v) {
        html += '<img id="b' + count + '" class="bi" style="top:' + v.top + 'px; left:' + v.left + 'px;" draggable="true" src="' + v.src + '">';
        count++;
      });
      return html;
    }

    function getBase64(file, onLoadCallback) {
      return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  });
})(window.jQuery);