/*
 * Copyright (c) 2012-2016, b3log.org & hacpai.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview util and every page should be used.
 *
 * @author <a href="http://vanessa.b3log.org">Liyuan Li</a>
 * @author <a href="http://88250.b3log.org">Liang Ding</a>
 * @author Zephyr
 * @version 1.31.20.26, Aug 26, 2016
 */

/**
 * @description Util
 * @static
 */
var Util = {
    /**
     * 粘贴中包含图片和文案时，需要处理为 markdown 语法
     * @param {type} text
     * @returns {String}
     */
    processClipBoard: function (text, cm) {
        var text = toMarkdown(text, {converters: [
                {
                    filter: 'img',
                    replacement: function (innerHTML, node) {
                        if (1 === node.attributes.length) {
                            return "";
                        }

                        var requestJSONObject = {
                            url: node.src
                        };

                        $.ajax({
                            url: Label.servePath + "/fetch-upload",
                            type: "POST",
                            data: JSON.stringify(requestJSONObject),
                            cache: false,
                            success: function (result, textStatus) {
                                if (result.sc) {
                                    var value = cm.getValue();
                                    value = value.replace(result.originalURL, result.url);
                                    cm.setValue(value);
                                }
                            }
                        });

                        return "![](" + node.src + ")";
                    }
                }
            ], gfm: true});

        // ascii 160 替换为 30
        text = $('<div>' + text + '</div>').text().replace(/\n{2,}/g, '\n\n').replace(/ /g, ' ');
        return $.trim(text);
    },
    /**
     * @description 根据 url search 获取值
     * @param {type} name
     * @returns {String}
     */
    getParameterByName: function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);

        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    /**
     * 通过 UA 获取设备 
     * @param {String} ua user agent
     * @returns {String} 设备
     */
    getDeviceByUa: function (ua) {
        $.ua.set(ua);
        var name = $.ua.device.model ? $.ua.device.model : $.ua.os.name;

        if (!name || name === 'Windows') {
            name = '';
        }
        return name;
    },
    /**
     * 初始化 algolia 搜索
     * @returns {undefined}
     */
    initSearch: function (algoliaAppId, algoliaSearchKey, algoliaIndex) {
        var client = algoliasearch(algoliaAppId, algoliaSearchKey);
        var index = client.initIndex(algoliaIndex);
        $('#search').autocomplete({
            hint: false,
            templates: {
                footer: '<div class="fn-right fn-pointer" onclick="window.open(\'https://www.algolia.com/referrals/1faf0d17/join\')">'
                        + '<span class="ft-gray">With &hearts; from</span> <img src="' + Label.staticServePath + '/images/services/algolia128x40.png" /> </div>'
            }
        }, [{
                source: function (q, cb) {
                    index.search(q, {hitsPerPage: 20}, function (error, content) {
                        if (error) {
                            cb([]);
                            return;
                        }
                        cb(content.hits, content);
                    });
                },
                displayKey: 'name',
                templates: {
                    suggestion: function (suggestion) {
                        return suggestion._highlightResult.articleTitle.value;
                    }
                }
            }
        ]).on('autocomplete:selected', function (event, suggestion, dataset) {
            window.open("/article/" + suggestion.oId);
        });
    },
    initTextarea: function (id, keyupEvent) {
        var editor = {
            $it: $('#' + id),
            setValue: function (val) {
                this.$it.val(val);
            },
            getValue: function () {
                return this.$it.val();
            },
            setOption: function (attr, val) {
                this.$it.prop(attr, val);
            },
            focus: function () {
                this.$it.focus();
            }
        };

        if (keyupEvent && typeof (keyupEvent) === 'function') {
            editor.$it.keyup(function () {
                keyupEvent(editor);
            });
        }

        return editor;
    },
    initCodeMirror: function () {
        var allEmoj = "+1,-1,100,1234,8ball,a,ab,abc,abcd,accept,aerial_tramway,airplane,alarm_clock,alien,ambulance,anchor,angel,anger,angry,anguished,ant,apple,aquarius,aries,arrow_backward,arrow_double_down,arrow_double_up,arrow_down,arrow_down_small,arrow_forward,arrow_heading_down,arrow_heading_up,arrow_left,arrow_lower_left,arrow_lower_right,arrow_right,arrow_right_hook,arrow_up,arrow_up_down,arrow_up_small,arrow_upper_left,arrow_upper_right,arrows_clockwise,arrows_counterclockwise,art,articulated_lorry,astonished,atm,b,baby,baby_bottle,baby_chick,baby_symbol,back,baggage_claim,balloon,ballot_box_with_check,bamboo,banana,bangbang,bank,bar_chart,barber,baseball,basketball,bath,bathtub,battery,bear,bee,beer,beers,beetle,beginner,bell,bento,bicyclist,bike,bikini,bird,birthday,black_circle,black_joker,black_medium_small_square,black_medium_square,black_nib,black_small_square,black_square,black_square_button,blossom,blowfish,blue_book,blue_car,blue_heart,blush,boar,boat,bomb,book,bookmark,bookmark_tabs,books,boom,boot,bouquet,bow,bowling,bowtie,boy,bread,bride_with_veil,bridge_at_night,briefcase,broken_heart,bug,bulb,bullettrain_front,bullettrain_side,bus,busstop,bust_in_silhouette,busts_in_silhouette,cactus,cake,calendar,calling,camel,camera,cancer,candy,capital_abcd,capricorn,car,card_index,carousel_horse,cat,cat2,cd,chart,chart_with_downwards_trend,chart_with_upwards_trend,checkered_flag,cherries,cherry_blossom,chestnut,chicken,children_crossing,chocolate_bar,christmas_tree,church,cinema,circus_tent,city_sunrise,city_sunset,cl,clap,clapper,clipboard,clock1,clock10,clock1030,clock11,clock1130,clock12,clock1230,clock130,clock2,clock230,clock3,clock330,clock4,clock430,clock5,clock530,clock6,clock630,clock7,clock730,clock8,clock830,clock9,clock930,closed_book,closed_lock_with_key,closed_umbrella,cloud,clubs,cn,cocktail,coffee,cold_sweat,collision,computer,confetti_ball,confounded,confused,congratulations,construction,construction_worker,convenience_store,cookie,cool,cop,copyright,corn,couple,couple_with_heart,couplekiss,cow,cow2,credit_card,crescent_moon,crocodile,crossed_flags,crown,cry,crying_cat_face,crystal_ball,cupid,curly_loop,currency_exchange,curry,custard,customs,cyclone,dancer,dancers,dango,dart,dash,date,de,deciduous_tree,department_store,diamond_shape_with_a_dot_inside,diamonds,disappointed,disappointed_relieved,dizzy,dizzy_face,do_not_litter,dog,dog2,dollar,dolls,dolphin,donut,door,doughnut,dragon,dragon_face,dress,dromedary_camel,droplet,dvd,e-mail,ear,ear_of_rice,earth_africa,earth_americas,earth_asia,egg,eggplant,eight,eight_pointed_black_star,eight_spoked_asterisk,electric_plug,elephant,email,end,envelope,es,euro,european_castle,european_post_office,evergreen_tree,exclamation,expressionless,eyeglasses,eyes,facepunch,factory,fallen_leaf,family,fast_forward,fax,fearful,feelsgood,feet,ferris_wheel,file_folder,finnadie,fire,fire_engine,fireworks,first_quarter_moon,first_quarter_moon_with_face,fish,fish_cake,fishing_pole_and_fish,fist,five,flags,flashlight,floppy_disk,flower_playing_cards,flushed,foggy,football,fork_and_knife,fountain,four,four_leaf_clover,fr,free,fried_shrimp,fries,frog,frowning,fu,fuelpump,full_moon,full_moon_with_face,game_die,gb,gem,gemini,ghost,gift,gift_heart,girl,globe_with_meridians,goat,goberserk,godmode,golf,grapes,green_apple,green_book,green_heart,grey_exclamation,grey_question,grimacing,grin,grinning,guardsman,guitar,gun,haircut,hamburger,hammer,hamster,hand,handbag,hankey,hash,hatched_chick,hatching_chick,headphones,hear_no_evil,heart,heart_decoration,heart_eyes,heart_eyes_cat,heartbeat,heartpulse,hearts,heavy_check_mark,heavy_division_sign,heavy_dollar_sign,heavy_exclamation_mark,heavy_minus_sign,heavy_multiplication_x,heavy_plus_sign,helicopter,herb,hibiscus,high_brightness,high_heel,hocho,honey_pot,honeybee,horse,horse_racing,hospital,hotel,hotsprings,hourglass,hourglass_flowing_sand,house,house_with_garden,hurtrealbad,hushed,ice_cream,icecream,id,ideograph_advantage,imp,inbox_tray,incoming_envelope,information_desk_person,information_source,innocent,interrobang,iphone,it,izakaya_lantern,jack_o_lantern,japan,japanese_castle,japanese_goblin,japanese_ogre,jeans,joy,joy_cat,jp,key,keycap_ten,kimono,kiss,kissing,kissing_cat,kissing_closed_eyes,kissing_face,kissing_heart,kissing_smiling_eyes,koala,koko,kr,large_blue_circle,large_blue_diamond,large_orange_diamond,last_quarter_moon,last_quarter_moon_with_face,laughing,leaves,ledger,left_luggage,left_right_arrow,leftwards_arrow_with_hook,lemon,leo,leopard,libra,light_rail,link,lips,lipstick,lock,lock_with_ink_pen,lollipop,loop,loudspeaker,love_hotel,love_letter,low_brightness,m,mag,mag_right,mahjong,mailbox,mailbox_closed,mailbox_with_mail,mailbox_with_no_mail,man,man_with_gua_pi_mao,man_with_turban,mans_shoe,maple_leaf,mask,massage,meat_on_bone,mega,melon,memo,mens,metal,metro,microphone,microscope,milky_way,minibus,minidisc,mobile_phone_off,money_with_wings,moneybag,monkey,monkey_face,monorail,mortar_board,mount_fuji,mountain_bicyclist,mountain_cableway,mountain_railway,mouse,mouse2,movie_camera,moyai,muscle,mushroom,musical_keyboard,musical_note,musical_score,mute,nail_care,name_badge,neckbeard,necktie,negative_squared_cross_mark,neutral_face,new,new_moon,new_moon_with_face,newspaper,ng,nine,no_bell,no_bicycles,no_entry,no_entry_sign,no_good,no_mobile_phones,no_mouth,no_pedestrians,no_smoking,non-potable_water,nose,notebook,notebook_with_decorative_cover,notes,nut_and_bolt,o,o2,ocean,octocat,octopus,oden,office,ok,ok_hand,ok_woman,older_man,older_woman,on,oncoming_automobile,oncoming_bus,oncoming_police_car,oncoming_taxi,one,open_file_folder,open_hands,open_mouth,ophiuchus,orange_book,outbox_tray,ox,package,page_facing_up,page_with_curl,pager,palm_tree,panda_face,paperclip,parking,part_alternation_mark,partly_sunny,passport_control,paw_prints,peach,pear,pencil,pencil2,penguin,pensive,performing_arts,persevere,person_frowning,person_with_blond_hair,person_with_pouting_face,phone,pig,pig2,pig_nose,pill,pineapple,pisces,pizza,plus1,point_down,point_left,point_right,point_up,point_up_2,police_car,poodle,poop,post_office,postal_horn,postbox,potable_water,pouch,poultry_leg,pound,pouting_cat,pray,princess,punch,purple_heart,purse,pushpin,put_litter_in_its_place,question,rabbit,rabbit2,racehorse,radio,radio_button,rage,rage1,rage2,rage3,rage4,railway_car,rainbow,raised_hand,raised_hands,raising_hand,ram,ramen,rat,recycle,red_car,red_circle,registered,relaxed,relieved,repeat,repeat_one,restroom,revolving_hearts,rewind,ribbon,rice,rice_ball,rice_cracker,rice_scene,ring,rocket,roller_coaster,rooster,rose,rotating_light,round_pushpin,rowboat,ru,rugby_football,runner,running,running_shirt_with_sash,sa,sagittarius,sailboat,sake,sandal,santa,satellite,satisfied,saxophone,school,school_satchel,scissors,scorpius,scream,scream_cat,scroll,seat,secret,see_no_evil,seedling,seven,shaved_ice,sheep,shell,ship,shipit,shirt,shit,shoe,shower,signal_strength,six,six_pointed_star,ski,skull,sleeping,sleepy,slot_machine,small_blue_diamond,small_orange_diamond,small_red_triangle,small_red_triangle_down,smile,smile_cat,smiley,smiley_cat,smiling_imp,smirk,smirk_cat,smoking,snail,snake,snowboarder,snowflake,snowman,sob,soccer,soon,sos,sound,space_invader,spades,spaghetti,sparkle,sparkler,sparkles,sparkling_heart,speak_no_evil,speaker,speech_balloon,speedboat,squirrel,star,star2,stars,station,statue_of_liberty,steam_locomotive,stew,straight_ruler,strawberry,stuck_out_tongue,stuck_out_tongue_closed_eyes,stuck_out_tongue_winking_eye,sun_with_face,sunflower,sunglasses,sunny,sunrise,sunrise_over_mountains,surfer,sushi,suspect,suspension_railway,sweat,sweat_drops,sweat_smile,sweet_potato,swimmer,symbols,syringe,tada,tanabata_tree,tangerine,taurus,taxi,tea,telephone,telephone_receiver,telescope,tennis,tent,thought_balloon,three,thumbsdown,thumbsup,ticket,tiger,tiger2,tired_face,tm,toilet,tokyo_tower,tomato,tongue,top,tophat,tractor,traffic_light,train,train2,tram,triangular_flag_on_post,triangular_ruler,trident,triumph,trolleybus,trollface,trophy,tropical_drink,tropical_fish,truck,trumpet,tshirt,tulip,turtle,tv,twisted_rightwards_arrows,two,two_hearts,two_men_holding_hands,two_women_holding_hands,u5272,u5408,u55b6,u6307,u6708,u6709,u6e80,u7121,u7533,u7981,u7a7a,uk,umbrella,unamused,underage,unlock,up,us,v,vertical_traffic_light,vhs,vibration_mode,video_camera,video_game,violin,virgo,volcano,vs,walking,waning_crescent_moon,waning_gibbous_moon,warning,watch,water_buffalo,watermelon,wave,wavy_dash,waxing_crescent_moon,waxing_gibbous_moon,wc,weary,wedding,whale,whale2,wheelchair,white_check_mark,white_circle,white_flower,white_large_square,white_medium_small_square,white_medium_square,white_small_square,white_square_button,wind_chime,wine_glass,wink,wolf,woman,womans_clothes,womans_hat,womens,worried,wrench,x,yellow_heart,yen,yum,zap,zero,zzz";
        var emojString = '';

        $.ajax({
            async: false,
            url: Label.servePath + "/users/emotions",
            type: "GET",
            success: function (result) {
                emojString = result.emotions;
            }
        });

        if ("" === emojString) {
            emojString = allEmoj;
        } else {
            var temp = emojString.split(",");
            for (var ti = 0; ti < temp.length; ti++) {
                allEmoj = allEmoj.replace(temp[ti] + ',', ',');
            }
            emojString = emojString + ',' + allEmoj;
        }
        emojString = emojString.replace(/,+/g, ','); // 全局替换重复的逗号

        var emojis = emojString.split(/,/);
        var emojiAutocompleteHints = [];
        for (var i = 0; i < emojis.length; i++) {
            var displayText = emojis[i];
            var text = emojis[i];
            emojiAutocompleteHints.push({
                displayText: "<span>" + displayText +
                        '&nbsp;<img style="width: 16px" src="' + Label.staticServePath + '/js/lib/emojify.js-1.1.0/images/basic/' + text + '.png"></span>',
                text: text + ": "
            });
        }

        CodeMirror.registerHelper("hint", "userName", function (cm) {
            var word = /[\w$]+/;
            var cur = cm.getCursor(), curLine = cm.getLine(cur.line);
            var start = cur.ch, end = start;
            while (end < curLine.length && word.test(curLine.charAt(end))) {
                ++end;
            }
            while (start && word.test(curLine.charAt(start - 1))) {
                --start;
            }
            var tok = cm.getTokenAt(cur);
            var autocompleteHints = [];

            if (tok.string.indexOf('@') !== 0) {
                return false;
            }

            $.ajax({
                async: false,
                url: Label.servePath + "/users/names?name=" + tok.string.substring(1),
                type: "GET",
                success: function (result) {
                    if (!result.sc || !result.userNames) {
                        return;
                    }

                    for (var i = 0; i < result.userNames.length; i++) {
                        var user = result.userNames[i];
                        var name = user.userName;
                        var avatar = user.userAvatarURL;
                        var updateTime = user.userUpdateTime;

                        autocompleteHints.push({
                            displayText: "<span style='font-size: 1rem;line-height:22px'><img style='width: 1rem;height: 1rem;margin:3px 0;float:left' src='" + avatar
                                    + "'> " + name + "</span>",
                            text: name + " "
                        });
                    }

                    if ('comment' === cm['for']) {
                        autocompleteHints.push({
                            displayText: "<span style='font-size: 1rem;line-height:22px'>"
                                    + "<img style='width: 1rem;height: 1rem;margin:3px 0;float:left' src='/images/user-thumbnail.png'> @参与者</span>",
                            text: "participants "
                        });
                    }
                }
            });

            return {list: autocompleteHints, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end)};
        });

        CodeMirror.registerHelper("hint", "emoji", function (cm) {
            var word = /[\w$]+/;
            var cur = cm.getCursor(), curLine = cm.getLine(cur.line);
            var start = cur.ch, end = start;
            while (end < curLine.length && word.test(curLine.charAt(end))) {
                ++end;
            }
            while (start && word.test(curLine.charAt(start - 1))) {
                --start;
            }
            var tok = cm.getTokenAt(cur);
            var autocompleteHints = [];
            var input = tok.string.trim();
            var matchCnt = 0;
            for (var i = 0; i < emojis.length; i++) {
                var displayText = emojis[i];
                var text = emojis[i];
                if (Util.startsWith(text, input)) {
                    autocompleteHints.push({
                        displayText: '<span style="font-size: 1rem;line-height:22px"><img style="width: 1rem;margin:3px 0;float:left" src="' + Label.staticServePath + '/js/lib/emojify.js-1.1.0/images/basic/' + text + '.png"> ' +
                                displayText.toString() + '</span>',
                        text: ":" + text + ": "
                    });
                    matchCnt++;
                }

                if (matchCnt > 10) {
                    break;
                }
            }

            return {list: autocompleteHints, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end)};
        });

        CodeMirror.commands.autocompleteUserName = function (cm) {
            cm.showHint({hint: CodeMirror.hint.userName, completeSingle: false});
            return CodeMirror.Pass;
        };

        CodeMirror.commands.autocompleteEmoji = function (cm) {
            cm.showHint({hint: CodeMirror.hint.emoji, completeSingle: false});
            return CodeMirror.Pass;
        };

        CodeMirror.commands.startAudioRecord = function (cm) {
            if (!Audio.availabel) {
                Audio.init();
            }

            if (Audio.availabel) {
                Audio.handleStartRecording();

                var cursor = cm.getCursor();
                cm.replaceRange(Label.audioRecordingLabel, cursor, cursor);
            }
        };

        CodeMirror.commands.endAudioRecord = function (cm) {
            if (!Audio.availabel) {
                return;
            }

            Audio.handleStopRecording();

            var cursor = cm.getCursor();
            cm.replaceRange(Label.uploadingLabel, CodeMirror.Pos(cursor.line, cursor.ch - Label.audioRecordingLabel.length), cursor);

            var blob = Audio.wavFileBlob.getDataBlob();
            var key = Math.floor(Math.random() * 100) + "" + new Date().getTime() + ""
                    + Math.floor(Math.random() * 100) + ".wav";

            var reader = new FileReader();
            reader.onload = function (event) {
                if ("" !== qiniuToken) {
                    var fd = new FormData();
                    fd.append('token', qiniuToken);
                    fd.append('file', blob);
                    fd.append('key', key);

                    $.ajax({
                        type: 'POST',
                        url: 'https://up.qbox.me/',
                        data: fd,
                        processData: false,
                        contentType: false,
                        paramName: "file",
                        success: function (data) {
                            var cursor = cm.getCursor();
                            cm.replaceRange('<audio controls="controls" src="' + qiniuDomain + '/' + key + '"></audio>\n\n',
                                    CodeMirror.Pos(cursor.line, cursor.ch - Label.uploadingLabel.length), cursor);
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            alert("Error: " + errorThrown);
                            var cursor = cm.getCursor();
                            cm.replaceRange('', CodeMirror.Pos(cursor.line, cursor.ch - Label.uploadingLabel.length), cursor);
                        }
                    });
                } else { // 说明没有使用七牛，而是使用本地
                    var fd = new FormData();
                    fd.append('file', blob);
                    fd.append('key', key);

                    $.ajax({
                        type: 'POST',
                        url: Label.servePath + '/upload',
                        data: fd,
                        processData: false,
                        contentType: false,
                        paramName: "file",
                        success: function (data) {
                            var cursor = cm.getCursor();
                            cm.replaceRange('<audio controls="controls" src="' + data.key + '"></audio>\n\n',
                                    CodeMirror.Pos(cursor.line, cursor.ch - Label.uploadingLabel.length), cursor);
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            alert("Error: " + errorThrown);
                            var cursor = cm.getCursor();
                            cm.replaceRange('', CodeMirror.Pos(cursor.line, cursor.ch - Label.uploadingLabel.length), cursor);
                        }
                    });
                }
            };

            // trigger the read from the reader...
            reader.readAsDataURL(blob);
        };
    },
    /**
     * @description 鼠标移动到文章列表标题上时，显示其开头内容
     */
    _initArticlePreview: function () {
        $(".article-list h2 > a").hover(function () {
            var $ele = $(this);

            if (3 === $ele.data('type')) { // 如果是思绪
                // 不进行预览
                return false;
            }

            $ele.addClass("previewing");

            var $li = $ele.closest("li"),
                    previewHTML = '<div class="preview"><span class="ico-arrow"></span><span class="ico-arrowborder"></span>';
            $(".article-list .preview").hide();
            if ($li.find('.preview').length === 1) {
                $li.find('.preview').show();

                return false;
            }

            if ($li.find('.no-preview').length === 1) {
                return false;
            }

            setTimeout(function () {
                if (!$ele.hasClass("previewing")) {
                    return false;
                }

                $.ajax({
                    url: Label.servePath + "/article/" + $ele.data('id') + "/preview",
                    type: "GET",
                    cache: false,
                    success: function (result, textStatus) {
                        if (!result.sc || $.trim(result.html) === '') {
                            $li.append('<div class="no-preview"></div>');
                            return false;
                        }

                        $li.append(previewHTML + result.html + '</div>');
                        $li.find('.preview').show();
                    }
                });
            }, 800);
        }, function () {
            var $li = $(this).closest("li");
            $li.find('.preview').hide();

            $(this).removeClass("previewing");
        });
    },
    /**
     * @description 标记指定类型的消息通知为已读状态.
     * @param {String} type 指定类型："commented"/"at"/"followingUser"
     */
    makeNotificationRead: function (type) {
        $.ajax({
            url: Label.servePath + "/notification/read/" + type,
            type: "GET",
            cache: false
        });
    },
    /**
     * @description 设置当前登录用户的未读提醒计数.
     */
    setUnreadNotificationCount: function () {
        $.ajax({
            url: Label.servePath + "/notification/unread/count",
            type: "GET",
            cache: false,
            success: function (result, textStatus) {
                var count = result.unreadNotificationCount;

                if (0 < count) {
                    $("#aNotifications").removeClass("no-msg").addClass("msg").text(count);

                    if (window.localStorage) {
                        if (count !== Number(window.localStorage.unreadNotificationCount) && 0 === result.userNotifyStatus) {
                            // Webkit Desktop Notification
                            var msg = Label.desktopNotificationTemplateLabel;
                            msg = msg.replace("${count}", count);
                            var options = {
                                iconUrl: '/images/faviconH.png',
                                title: '黑客与画家',
                                body: msg,
                                timeout: 5000,
                                onclick: function () {
                                    console.log('~');
                                }
                            };

                            $.notification(options);

                            window.localStorage.unreadNotificationCount = count;
                        }
                    }
                } else {
                    $("#aNotifications").removeClass("msg").addClass("no-msg").text(count);

                    if (window.localStorage) {
                        window.localStorage.unreadNotificationCount = 0;
                    }
                }
            }
        });
    },
    /**
     * @description 关注
     * @param {BOM} it 触发事件的元素
     * @param {String} id 关注 id
     * @param {String} type 关注的类型
     * @param {String} index 为数字时表示关注数，String 时表示来源
     */
    follow: function (it, id, type, index) {
        if (!Label.isLoggedIn) {
            Util.needLogin();
            return false;
        }

        if ($(it).hasClass("disabled")) {
            return false;
        }

        var requestJSONObject = {
            followingId: id
        };
        $(it).addClass("disabled");
        $.ajax({
            url: Label.servePath + "/follow/" + type,
            type: "POST",
            cache: false,
            data: JSON.stringify(requestJSONObject),
            success: function (result, textStatus) {
                if (result.sc) {
                    $(it).removeClass("disabled");
                    if ("article" === type || ("tag" === type && typeof (index) !== 'undefined')) {
                        $(it).html('<span class="icon-star ft-red"></span>').
                                attr("onclick", "Util.unfollow(this, '" + id + "', '" + type + "', " + (index + 1) + ")")
                                .attr("aria-label", Label.uncollectLabel + ' ' +
                                        (index + 1));
                    } else {
                        $(it).removeClass("green").addClass("red")
                                .attr("onclick", "Util.unfollow(this, '" + id + "', '" + type + "')")
                                .text(Label.unfollowLabel);
                    }
                }
            },
            complete: function () {
                $(it).removeClass("disabled");
            }
        });
    },
    /**
     * @description 取消关注
     * @param {BOM} it 触发事件的元素
     * @param {String} id 关注 id
     * @param {String} type 取消关注的类型
     * @param {String} index 为数字时表示关注数，String 时表示来源
     */
    unfollow: function (it, id, type, index) {
        if ($(it).hasClass("disabled")) {
            return false;
        }

        var requestJSONObject = {
            followingId: id
        };
        $(it).addClass("disabled");
        $.ajax({
            url: Label.servePath + "/follow/" + type,
            type: "DELETE",
            cache: false,
            data: JSON.stringify(requestJSONObject),
            success: function (result, textStatus) {
                if (result.sc) {
                    if ("article" === type || ("tag" === type && typeof (index) !== 'undefined')) {
                        $(it).removeClass('ft-red').html('<span class="icon-star"></span>')
                                .attr("onclick", "Util.follow(this, '" + id + "', '" + type + "'," + (index - 1) + ")")
                                .attr("aria-label", Label.collectLabel + ' ' + (index - 1));
                    } else {
                        $(it).removeClass("red").addClass("green")
                                .attr("onclick", "Util.follow(this, '" + id + "', '" + type + "')")
                                .text(Label.followLabel);
                    }
                }
            },
            complete: function () {
                $(it).removeClass("disabled");
            }
        });
    },
    /**
     * @description 回到顶部
     */
    goTop: function () {
        $('html, body').animate({scrollTop: 0}, 800);
    },
    /**
     * @description 显示登录界面 
     */
    showLogin: function () {
        $(".nav .form").show();
        $("#nameOrEmail").focus();
    },
    /**
     * 
     * @returns {undefined}
     */
    needLogin: function () {
        alert(Label.funNeedLoginLabel);
    },
    /**
     * @description 跳转到注册页面
     */
    goRegister: function () {
        if (-1 !== location.href.indexOf("/register")) {
            window.location.reload();

            return;
        }

        window.location.href = Label.servePath + "/register?goto=" + encodeURIComponent(location.href);
    },
    /**
     * @description 禁止 IE7 以下浏览器访问
     */
    _kill: function () {
        if ($.ua.browser.name === 'IE' && parseInt($.ua.browser.version) < 10) {
            $.ajax({
                url: Label.servePath + "/kill-browser",
                type: "GET",
                cache: false,
                success: function (result, textStatus) {
                    $("body").append(result);
                    $("#killBrowser").dialog({
                        "modal": true,
                        "hideFooter": true,
                        "height": 345,
                        "width": 600
                    });
                    $("#killBrowser").dialog("open");
                }
            });
        }
    },
    /**
     * 每日活跃样式
     * @returns {undefined}
     */
    _initActivity: function () {
        var $percent = $('.person-info'),
                percent = $percent.data('percent'),
                bottom = 0,
                side = 0,
                top = 0;
        if (percent <= 25) {
            bottom = parseInt(percent / 0.25);
        } else if (percent <= 75) {
            bottom = 100;
            side = parseInt((percent - 25) / 2 / 0.25);
        } else if (percent <= 100) {
            bottom = 100;
            side = 100;
            top = parseInt((percent - 75) / 0.25);
        }

        $percent.find('.bottom').css({
            'width': bottom + '%',
            'left': ((100 - bottom) / 2) + '%'
        });

        $percent.find('.top-left').css({
            'width': parseInt(top / 2) + '%',
            'left': 0
        });

        $percent.find('.top-right').css({
            'width': parseInt(top / 2) + '%',
            'right': 0
        });

        $percent.find('.left').css({
            'height': side + '%',
            'top': (100 - side) + '%'
        });

        $percent.find('.right').css({
            'height': side + '%',
            'top': (100 - side) + '%'
        });
    },
    /**
     * @description 初识化前台页面
     */
    init: function (isLoggedIn) {
        //禁止 IE7 以下浏览器访问
        this._kill();
        // 导航
        this._initNav();
        // 每日活跃
        this._initActivity();
        // 如果有列表就展现描述预览
        this._initArticlePreview();
        // 登录密码输入框回车事件
        $("#loginPassword").keyup(function (event) {
            if (event.keyCode === 13) {
                Util.login();
            }
        });
        // search input
        $(".nav .icon-search").click(function () {
            $(".nav input.search").focus();
        });
        $(".nav input.search").focus(function () {
            $(".nav .tags").css('visibility', 'hidden');
        }).blur(function () {
            $(".nav .tags").css('visibility', 'visible');
        });
        $(window).scroll(function () {
            if ($(window).scrollTop() >= $(document).height() - $(window).height()) {
                $(".icon-go-up").css({
                    "background-color": "#F8F8F8",
                    "border-radius": "5px 0 0 0",
                    "border-color": "#E0E0E0"
                }).show();
            } else if ($(window).scrollTop() > 20) {
                $(".icon-go-up").css({
                    "background-color": "#E7ECEE",
                    "border-radius": "5px 0 0 5px",
                    "border-color": "#D2D9DD"
                }).show();
            } else {
                $(".icon-go-up").hide();
            }
        });

        if (isLoggedIn) { // 如果登录了
            Util.setUnreadNotificationCount();

            // 定时获取并设置未读提醒计数
            setInterval(function () {
                Util.setUnreadNotificationCount();
            }, 60000);
        }

        console.log("%cCopyright \xa9 2012-%s, b3log.org & hacpai.com\n\n%cHacPai%c 平等、自由、奔放\n\n%cFeel easy about trust.",
                'font-size:12px;color:#999999;', (new Date).getFullYear(),
                'font-family: "Helvetica Neue", "Luxi Sans", "DejaVu Sans", Tahoma, "Hiragino Sans GB", "Microsoft Yahei", sans-serif;font-size:64px;color:#404040;-webkit-text-fill-color:#404040;-webkit-text-stroke: 1px #777;',
                'font-family: "Helvetica Neue", "Luxi Sans", "DejaVu Sans", Tahoma, "Hiragino Sans GB", "Microsoft Yahei", sans-serif;font-size:12px;color:#999999; font-style:italic;',
                'font-family: "Helvetica Neue", "Luxi Sans", "DejaVu Sans", Tahoma, "Hiragino Sans GB", "Microsoft Yahei", sans-serif;font-size:12px;color:#999999;'
                );
        if (isLoggedIn) {
            return false;
        }

        // 点击空白影藏登录框
        $('body').click(function (event) {
            if ($(event.target).closest('.nav .form').length === 0) {
                $('.nav .form').hide();
            }
        });
    },
    /**
     * @description 用户状态 channel.
     * @static
     */
    initUserChannel: function (channelServer) {
        var userChannel = new ReconnectingWebSocket(channelServer);
        userChannel.reconnectInterval = 10000;

        userChannel.onopen = function () {
            setInterval(function () {
                userChannel.send('-hb-');
            }, 1000 * 60 * 5);
        };

        userChannel.onmessage = function (evt) {
        };

        userChannel.onclose = function () {
            userChannel.close();
        };

        userChannel.onerror = function (err) {
            console.log("ERROR", err);
        };
    },
    /**
     * @description 设置导航状态
     */
    _initNav: function () {
        var href = location.href;
        $(".user-nav a").each(function () {
            if (href.indexOf($(this).attr("href")) === 0) {
                $(this).addClass("current");
            } else if (location.pathname === "/register") {
                // 注册没有使用 href，对其进行特殊处理
                $("#aRegister").addClass("current");
            } else if (href.indexOf(Label.servePath + '/settings') === 0) {
                $(".user-nav .nav-avatar").addClass("current");
            }
        });
    },
    /**
     * @description 登录
     */
    login: function () {
        if (Validate.goValidate({target: $('#loginTip'),
            data: [{
                    "target": $("#nameOrEmail"),
                    "type": "string",
                    "max": 256,
                    "msg": Label.loginNameErrorLabel
                }, {
                    "target": $("#loginPassword"),
                    "type": "password",
                    "msg": Label.invalidPasswordLabel
                }]})) {
            var requestJSONObject = {
                nameOrEmail: $("#nameOrEmail").val().replace(/(^\s*)|(\s*$)/g, ""),
                userPassword: calcMD5($("#loginPassword").val())
            };
            $.ajax({
                url: Label.servePath + "/login",
                type: "POST",
                cache: false,
                data: JSON.stringify(requestJSONObject),
                success: function (result, textStatus) {
                    if (result.sc) {
                        if ("/register" === document.location.pathname) {
                            window.location.href = "/";
                        } else {
                            window.location.reload();
                        }

                        if (window.localStorage) {
                            if (!window.localStorage.articleContent) {
                                window.localStorage.articleContent = "";
                            }

                            if (!window.localStorage.commentContent) {
                                window.localStorage.commentContent = "";
                            }

                            if (!window.localStorage.unreadNotificationCount) {
                                window.localStorage.unreadNotificationCount = 0;
                            }
                        }
                    } else {
                        $("#loginTip").addClass('error').html('<ul><li>' + result.msg + '</li></ul>');
                    }
                }
            });
        }
    },
    /**
     * @description 登出
     */
    logout: function () {
        if (window.localStorage) {
            // Clear localStorage
            window.localStorage.clear();
            window.localStorage.unreadNotificationCount = 0;
        }
        window.location.href = '/logout?goto=' + location.protocol + '//' + location.host;
    },
    /**
     * @description 获取字符串开始位置     
     * @param {String} string 需要匹配的字符串
     * @param {String} prefix 匹配字符
     * @return {Integer} 以匹配字符开头的位置
     */
    startsWith: function (string, prefix) {
        return (string.match("^" + prefix) == prefix);
    },
    /**
     * @description 文件上传     
     * @param {Obj} obj  文件上传参数
     * @param {String} obj.id 上传组件 id
     * @param {jQuery} obj.pasteZone 粘贴区域
     * @param {String} obj.qiniuUploadToken 七牛 Token，如果这个 token 是空，说明是上传本地服务器
     * @param {Obj} obj.editor 编辑器对象
     * @param {Obj} obj.uploadingLabel 上传中标签
     * @param {Strng} obj.qiniuDomain 七牛 Domain
     */
    uploadFile: function (obj) {
        var filename = "";
        var ext = "";
        var isImg = false;

        if ("" === obj.qiniuUploadToken) { // 说明没有使用七牛，而是使用本地
            $('#' + obj.id).fileupload({
                multipart: true,
                pasteZone: obj.pasteZone,
                dropZone: obj.pasteZone,
                url: "/upload",
                paramName: "file",
                add: function (e, data) {
                    filename = data.files[0].name;

                    if (!filename) {
                        ext = data.files[0].type.split("/")[1];
                    }

                    if (window.File && window.FileReader && window.FileList && window.Blob) {
                        var reader = new FileReader();
                        reader.readAsArrayBuffer(data.files[0]);
                        reader.onload = function (evt) {
                            var fileBuf = new Uint8Array(evt.target.result.slice(0, 11));
                            isImg = isImage(fileBuf);

                            if (isImg && evt.target.result.byteLength > obj.imgMaxSize) {
                                alert("This image is too large (max " + obj.imgMaxSize / 1024 / 1024 + "M)");

                                return;
                            }

                            if (!isImg && evt.target.result.byteLength > obj.fileMaxSize) {
                                alert("This file is too large (max " + obj.fileMaxSize / 1024 / 1024 + "M)");

                                return;
                            }

                            data.submit();
                        };
                    } else {
                        data.submit();
                    }
                },
                formData: function (form) {
                    var data = form.serializeArray();
                    return data;
                },
                submit: function (e, data) {
                    if (obj.editor.replaceRange) {
                        var cursor = obj.editor.getCursor();
                        obj.editor.replaceRange(obj.uploadingLabel, cursor, cursor);
                    } else {
                        $('#' + obj.id + ' input').prop('disabled', true);
                    }
                },
                done: function (e, data) {
                    var qiniuKey = data.result.key;
                    if (!qiniuKey) {
                        alert("Upload error");

                        return;
                    }

                    if (obj.editor.replaceRange) {
                        var cursor = obj.editor.getCursor();

                        if (!filename) {
                            filename = new Date().getTime();
                        }

                        if (isImg) {
                            obj.editor.replaceRange('![' + filename + '](' + qiniuKey + ') \n\n',
                                    CodeMirror.Pos(cursor.line, cursor.ch - obj.uploadingLabel.length), cursor);
                        } else {
                            obj.editor.replaceRange('[' + filename + '](' + qiniuKey + ') \n\n',
                                    CodeMirror.Pos(cursor.line, cursor.ch - obj.uploadingLabel.length), cursor);
                        }
                    } else {
                        obj.editor.$it.val(obj.editor.$it.val() + '![' + filename + '](' + qiniuKey + ') \n\n');
                        $('#' + obj.id + ' input').prop('disabled', false);
                    }
                },
                fail: function (e, data) {
                    alert("Upload error: " + data.errorThrown);
                    if (obj.editor.replaceRange) {
                        var cursor = obj.editor.getCursor();
                        obj.editor.replaceRange('',
                                CodeMirror.Pos(cursor.line, cursor.ch - obj.uploadingLabel.length), cursor);
                    } else {
                        $('#' + obj.id + ' input').prop('disabled', false);
                    }
                }
            }).on('fileuploadprocessalways', function (e, data) {
                var currentFile = data.files[data.index];
                if (data.files.error && currentFile.error) {
                    alert(currentFile.error);
                }
            });

            return;
        }

        $('#' + obj.id).fileupload({
            multipart: true,
            pasteZone: obj.pasteZone,
            dropZone: obj.pasteZone,
            url: "https://up.qbox.me/",
            paramName: "file",
            add: function (e, data) {
                filename = data.files[0].name;

                if (!filename) {
                    ext = data.files[0].type.split("/")[1];
                }

                if (window.File && window.FileReader && window.FileList && window.Blob) {
                    var reader = new FileReader();
                    reader.readAsArrayBuffer(data.files[0]);
                    reader.onload = function (evt) {
                        var fileBuf = new Uint8Array(evt.target.result.slice(0, 11));
                        isImg = isImage(fileBuf);

                        if (isImg && evt.target.result.byteLength > obj.imgMaxSize) {
                            alert("This image is too large (max " + obj.imgMaxSize / 1024 / 1024 + "M)");

                            return;
                        }

                        if (!isImg && evt.target.result.byteLength > obj.fileMaxSize) {
                            alert("This file is too large (max " + obj.fileMaxSize / 1024 / 1024 + "M)");

                            return;
                        }

                        data.submit();
                    }
                } else {
                    data.submit();
                }
            },
            formData: function (form) {
                var data = form.serializeArray();

                if (filename) {
                    filename = filename.replace(/ /g, "_");
                    data.push({name: 'key', value: "file/" + getUUID() + "/" + filename});
                } else {
                    data.push({name: 'key', value: getUUID() + "." + ext});
                }

                data.push({name: 'token', value: obj.qiniuUploadToken});

                return data;
            },
            submit: function (e, data) {
                if (obj.editor.replaceRange) {
                    var cursor = obj.editor.getCursor();
                    obj.editor.replaceRange(obj.uploadingLabel, cursor, cursor);
                } else {
                    $('#' + obj.id + ' input').prop('disabled', false);
                }
            },
            done: function (e, data) {
                var qiniuKey = data.result.key;
                if (!qiniuKey) {
                    alert("Upload error");

                    return;
                }

                if (obj.editor.replaceRange) {
                    var cursor = obj.editor.getCursor();

                    if (!filename) {
                        filename = new Date().getTime();
                    }

                    if (isImg) {
                        obj.editor.replaceRange('![' + filename + '](' + obj.qiniuDomain + '/' + qiniuKey + ') \n\n',
                                CodeMirror.Pos(cursor.line, cursor.ch - obj.uploadingLabel.length), cursor);
                    } else {
                        obj.editor.replaceRange('[' + filename + '](' + obj.qiniuDomain + '/' + qiniuKey + ') \n\n',
                                CodeMirror.Pos(cursor.line, cursor.ch - obj.uploadingLabel.length), cursor);
                    }
                } else {
                    obj.editor.$it.val('![' + filename + '](' + obj.qiniuDomain + '/' + qiniuKey + ') \n\n');
                    $('#' + obj.id + ' input').prop('disabled', false);
                }
            },
            fail: function (e, data) {
                alert("Upload error: " + data.errorThrown);
                if (obj.editor.replaceRange) {
                    var cursor = obj.editor.getCursor();
                    obj.editor.replaceRange('',
                            CodeMirror.Pos(cursor.line, cursor.ch - obj.uploadingLabel.length), cursor);
                } else {
                    $('#' + obj.id + ' input').prop('disabled', false);
                }
            }
        }).on('fileuploadprocessalways', function (e, data) {
            var currentFile = data.files[data.index];
            if (data.files.error && currentFile.error) {
                alert(currentFile.error);
            }
        });
    },
    /**
     * @description Mouse click special effects.
     */
    mouseClickEffects: function () {
        var click_cnt = 0;
        jQuery(document).ready(function ($) {
            $("html").click(function (e) {
                var n = 18;
                var $i;
                click_cnt++;
                if (click_cnt == 10) {
                    $i = $("<b></b>").text("OωO");
                } else if (click_cnt === 20) {
                    $i = $("<b></b>").text("(๑•́ ∀ •̀๑)");
                } else if (click_cnt === 30) {
                    $i = $("<b></b>").text("(๑•́ ₃ •̀๑)");
                } else if (click_cnt === 40) {
                    $i = $("<b></b>").text("(๑•̀_•́๑)");
                } else if (click_cnt === 50) {
                    $i = $("<b></b>").text("（￣へ￣）");
                } else if (click_cnt === 60) {
                    $i = $("<b></b>").text("(╯°口°)╯(┴—┴");
                } else if (click_cnt === 70) {
                    $i = $("<b></b>").text("૮( ᵒ̌皿ᵒ̌ )ა");
                } else if (click_cnt === 80) {
                    $i = $("<b></b>").text("╮(｡>口<｡)╭");
                } else if (click_cnt === 90) {
                    $i = $("<b></b>").text("( ง ᵒ̌皿ᵒ̌)ง⁼³₌₃");
                } else if (click_cnt >= 100 && click_cnt <= 105) {
                    $i = $("<b></b>").text("(ꐦ°᷄д°᷅)");
                } else {
                    $i = $("<i class='icon-heart'></i>");
                    n = Math.round(Math.random() * 14 + 6);
                }
                var x = e.pageX, y = e.pageY;
                $i.css({
                    "z-index": 9999,
                    "top": y - 20,
                    "left": x,
                    "position": "absolute",
                    "color": "#E94F06",
                    "font-size": n,
                    "-moz-user-select": "none",
                    "-webkit-user-select": "none",
                    "-ms-user-select": "none"
                });
                $("body").append($i);
                $i.animate(
                        {"top": y - 180, "opacity": 0},
                        1500,
                        function () {
                            $i.remove();
                        }
                );
            });
        });
    }
};
/**
 * @description 数据验证
 * @static
 */
var Validate = {
    /**
     * @description 提交时对数据进行统一验证。
     * @param {array} data 验证数据
     * @returns 验证通过返回 true，否则为 false。 
     */
    goValidate: function (obj) {
        var tipHTML = '<ul>';
        for (var i = 0; i < obj.data.length; i++) {
            if (!Validate.validate(obj.data[i])) {
                tipHTML += '<li>' + obj.data[i].msg + '</li>';
            }
        }

        if (tipHTML === '<ul>') {
            return true;
        } else {
            obj.target.html(tipHTML + '</ul>');
            obj.target.addClass('error');
            return false;
        }
    },
    /**
     * @description 数据验证。
     * @param {object} data 验证数据
     * @param {string} data.type 验证类型
     * @param {object} data.target 验证对象 
     * @param {number} [data.min] 最小值 
     * @param {number} [data.max] 最大值 
     * @returns 验证通过返回 true，否则为 false。 
     */
    validate: function (data) {
        var isValidate = true,
                val = '';
        if (data.type === 'editor') {
            val = data.target.getValue();
        } else if (data.type === 'imgSrc') {
            val = data.target.attr('src');
        } else if (data.type === 'imgStyle') {
            val = data.target.data('imageurl');
        } else {
            val = data.target.val().toString().replace(/(^\s*)|(\s*$)/g, "");
        }
        switch (data.type) {
            case "email":
                if (!/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(data.target.val())) {
                    isValidate = false;
                }
                break;
            case "password":
                if (data.target.val().length === 0 || data.target.val().length > 16) {
                    isValidate = false;
                }
                break;
            case "confirmPassword":
                if (data.target.val() !== data.original.val()) {
                    isValidate = false;
                }
                break;
            case "tags":
                var tagList = val.split(",");
                if (val === "" || tagList.length > 7) {
                    isValidate = false;
                }

                for (var i = 0; i < tagList.length; i++) {
                    if (tagList[i].replace(/(^\s*)|(\s*$)/g, "") === ""
                            || tagList[i].replace(/(^\s*)|(\s*$)/g, "").length > 50) {
                        isValidate = false;
                        break;
                    }
                }
                break;
            case "url":
            case "imgSrc":
            case "imgStyle":
                if (val === '' || (val !== "" && (!/^\w+:\/\//.test(val) || val.length > 100))) {
                    isValidate = false;
                }
                break;
            default:
                if (val.length <= data.max && val.length >= (data.min ? data.min : 0)) {
                    isValidate = true;
                } else {
                    isValidate = false;
                }
                break;
        }
        return isValidate;
    }
};
/**
 * @description 全局变量
 */
var Label = {};


// 开始 - 判断文件类型
var pngMagic = [
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
];
var jpeg_jfif = [
    0x4a, 0x46, 0x49, 0x46
];
var jpeg_exif = [
    0x45, 0x78, 0x69, 0x66
];
var jpegMagic = [
    0xFF, 0xD8, 0xFF, 0xE0
];
var gifMagic0 = [
    0x47, 0x49, 0x46, 0x38, 0x37, 0x61
];
var getGifMagic1 = [
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61
];
var wavMagic1 = [
    0x52, 0x49, 0x46, 0x46
];
var wavMagic2 = [
    0x57, 0x41, 0x56, 0x45
];

function arraycopy(src, index, dist, distIndex, size) {
    for (i = 0; i < size; i++) {
        dist[distIndex + i] = src[index + i]
    }
}

function arrayEquals(arr1, arr2) {
    if (arr1 == 'undefined' || arr2 == 'undefined') {
        return false
    }

    if (arr1 instanceof Array && arr2 instanceof Array) {
        if (arr1.length != arr2.length) {
            return false
        }

        for (i = 0; i < arr1.length; i++) {
            if (arr1[i] != arr2[i]) {
                return false
            }
        }


        return true
    }

    return false;
}

function isImage(buf) {
    return null !== getImageMime(buf);
}

function getImageMime(buf) {
    if (buf == null || buf == 'undefined' || buf.length < 8) {
        return null;
    }

    var bytes = [];
    arraycopy(buf, 0, bytes, 0, 6);
    if (isGif(bytes)) {
        return "image/gif";
    }

    bytes = [];
    arraycopy(buf, 6, bytes, 0, 4);
    if (isJpeg(bytes)) {
        return "image/jpeg";
    }

    bytes = [];
    arraycopy(buf, 0, bytes, 0, 8);
    if (isPng(bytes)) {
        return "image/png";
    }

    return null;
}

function isAudio(buf) {
    if (buf == null || buf == 'undefined' || buf.length < 12) {
        return null;
    }

    var bytes1 = [];
    arraycopy(buf, 0, bytes1, 0, 4);

    var bytes2 = [];
    arraycopy(buf, 8, bytes2, 0, 4);

    if (isWav(bytes1, bytes2)) {
        return "audio/wav";
    }

    return null;
}


/**
 * @param data first 6 bytes of file
 * @return gif image file true, other false
 */
function isGif(data) {
    //console.log('GIF')
    return arrayEquals(data, gifMagic0) || arrayEquals(data, getGifMagic1);
}

/**
 * @param data first 4 bytes of file
 * @return jpeg image file true, other false
 */
function isJpeg(data) {
    //console.log('JPEG')
    return arrayEquals(data, jpegMagic) || arrayEquals(data, jpeg_jfif) || arrayEquals(data, jpeg_exif);
}

/**
 * @param data first 8 bytes of file
 * @return png image file true, other false
 */
function isPng(data) {
    //console.log('PNG')
    return arrayEquals(data, pngMagic);
}

/**
 * @param data first 12 bytes of file
 * @return wav file true, other false
 */
function isWav(data1, data2) {
    return arrayEquals(data1, wavMagic1) && arrayEquals(data2, wavMagic2);
}

// 结束 - 判断文件类型
function getUUID() {
    var d = new Date().getTime();

    var ret = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

    ret = ret.replace(new RegExp("-", 'g'), "");

    return ret;
}

/**
 * @description Audio
 * @static
 */
var Audio = {
    availabel: false,
    wavFileBlob: null,
    recorderObj: null,
    /**
     * @description 初识化音频
     */
    init: function () {
        var detectGetUserMedia = new BrowserGetUserMediaDetection();

        //First, check to see if get user media is supported:
        console.log("Get user media supported: " + detectGetUserMedia.getUserMediaSupported());

        if (detectGetUserMedia.getUserMediaSupported()) {
            console.log("Get user media is supported!");
            console.log("Supported get user media method: " + detectGetUserMedia.getUserMediaMethod());

            console.log("Assigning get user media method.");
            navigator.getUserMedia = detectGetUserMedia.getUserMediaMethod();

            console.log("Requesting microphone access from browser.");
            navigator.getUserMedia({audio: true}, success, failure);
        } else {
            console.log("ERROR: getUserMedia not supported by browser.");

            alert('Your browser does not appear to support audio recording.');
        }

        //Get user media failure callback function:
        function failure(e) {
            console.log("getUserMedia->failure(): ERROR: Microphone access request failed!");

            var errorMessageToDisplay;
            var PERMISSION_DENIED_ERROR = "PermissionDeniedError";
            var DEVICES_NOT_FOUND_ERROR = "DevicesNotFoundError";

            console.log(e);
            console.log(e.name);

            switch (e.name) {
                case PERMISSION_DENIED_ERROR:
                    errorMessageToDisplay = Label.recordDeniedLabel;
                    break;
                case DEVICES_NOT_FOUND_ERROR:
                    errorMessageToDisplay = Label.recordDeviceNotFoundLabel;
                    break;
                default:
                    errorMessageToDisplay = 'ERROR: The following unexpected error occurred while attempting to connect to your microphone: ' + e.name;
                    break;
            }

            console.log("getUserMedia->failure(): " + errorMessageToDisplay);
            alert(errorMessageToDisplay);
        }

        //Get user media success callback function:
        function success(e) {
            console.log("getUserMedia->success(): Microphone access request was successful!");

            var BUFFER_SIZE = 2048;
            var RECORDING_MODE = PredefinedRecordingModes.MONO_5_KHZ; // 单声道 5kHz 最低的采样率
            var SAMPLE_RATE = RECORDING_MODE.getSampleRate();
            var OUTPUT_CHANNEL_COUNT = RECORDING_MODE.getChannelCount();

            console.log("getUserMedia->success(): Detecting window audio context.");
            var detectWindowAudioContext = new BrowserWindowAudioContextDetection();

            if (detectWindowAudioContext.windowAudioContextSupported()) {
                console.log("getUserMedia->success(): Window audio context supported.");

                var windowAudioContext = detectWindowAudioContext.getWindowAudioContextMethod();

                console.log("getUserMedia->success(): Window audio context method: " + windowAudioContext);

                console.log('getUserMedia->success(): Creating recorder object.');

                Audio.recorderObj = new SoundRecorder(windowAudioContext, BUFFER_SIZE, SAMPLE_RATE, OUTPUT_CHANNEL_COUNT);

                console.log('getUserMedia->success(): Initializing recorder object.');
                Audio.recorderObj.init(e);

                console.log('getUserMedia->success(): Assigning onaudioprocess event function.');

                Audio.recorderObj.recorder.onaudioprocess = function (e)
                {
                    //Do nothing if not recording:
                    if (!Audio.recorderObj.isRecording()) {
                        return;
                    }

                    // Copy the data from the input buffers;
                    var left = e.inputBuffer.getChannelData(0);
                    var right = e.inputBuffer.getChannelData(1);
                    Audio.recorderObj.cloneChannelData(left, right);
                    console.log('SoundRecorder.recorder.onaudioprocess: Saving audio data...');
                };

                console.log('getUserMedia->success(): Recorder object successfully created and initialized.');
                console.log('getUserMedia->success(): Recorder object ready status: ' + Audio.recorderObj.isReady());

                Audio.availabel = true;
            } else {
                var messageString = "Unable to detect window audio context, cannot continue.";
                console.log("getUserMedia->success(): " + messageString);
                alert(messageString);

                return;
            }
        }
    },
    /**
     * @description 开始录音
     */
    handleStartRecording: function () {
        console.log("Starting new recording...");
        Audio.recorderObj.startRecordingNewWavFile();
    },
    /**
     * @description 结束录音
     */
    handleStopRecording: function () {
        console.log("Stopping recording.");
        Audio.recorderObj.stopRecording();

        //Save the recording by building the wav file blob and send it to the client:
        console.log("Building wav file.");
        Audio.wavFileBlob = Audio.recorderObj.buildWavFileBlob();
    }
};
