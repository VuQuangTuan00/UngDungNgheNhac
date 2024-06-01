import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
  Animated,
  SectionList,
} from 'react-native';
import React from 'react';
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import songs from './model/Data';
import {useEffect, useRef, useState} from 'react';

const {width, height} = Dimensions.get('window');

var currentTrack = 'play';

let playerInitialized = false; // Biến để kiểm tra trạng thái khởi tạo của player

const setUpPlayer = async () => {
  if (!playerInitialized) {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.add(songs);
      playerInitialized = true; // Đánh dấu rằng player đã được khởi tạo
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log('Trình phát đã được khởi tạo');
  }
};

const togglePlayBack = async playBackState => {
  var play = '';

  if (currentTrack != null) {
    //console.log(currentTrack+"1")
    if (currentTrack == 'play') {
      await TrackPlayer.play();
      //console.log("ASdsd")
      play = 'pause';
      console.log(currentTrack);
    } else {
      await TrackPlayer.pause();
      play = 'play';
      console.log(currentTrack);
    }
  }
  currentTrack = play;
  //console.log(currentTrack)
};

const setupTrack = async () => {
  await TrackPlayer.setupPlayer();

  await TrackPlayer.add();
};

const MusicPlayer = () => {
  const progress = useProgress();
  const [isPressed, setIsPressed] = useState(false);
  const handleSliderChange = async value => {
    await TrackPlayer.seekTo(value); // Tua đến vị trí mong muốn trong bài hát
  };
  const handlePress = () => {
    setIsPressed(!isPressed); // Khi nhấn, đảo ngược trạng thái

    // Thực hiện các hành động khác bạn muốn ở đây, như gửi yêu cầu đến máy chủ, lưu trữ trạng thái, vv.
  };
  const PlaybackState = usePlaybackState();
  const [songIndex, setsongIndex] = useState(0);
  const srcollX = useRef(new Animated.Value(0)).current;
  const [isPlaying, setIsPlaying] = useState(false);
  const songSlider = useRef(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackArtwork, setTrackArtwork] = useState('');
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async event => {
    if (
      event.type === Event.PlaybackActiveTrackChanged &&
      event.nextTrack != null
    ) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
    }
  });
  const skipTo = async trackId => {
    await TrackPlayer.skip(trackId);
  };
  useEffect(() => {
    setUpPlayer();
    //setupTrack()
    srcollX.addListener(({value}) => {
      //console.log(`ScrollX : ${value} | Device Width : ${width}`);
      const index = Math.round(value / width);
      skipTo(index);
      setsongIndex(index);
      // console.log(index);
    });
    return () => {
      srcollX.removeAllListeners();
    };
  }, []);
  const skipToNext = () => {
    songSlider.current.scrollToOffset({
      offset: (songIndex + 1) * width,
    });
  };
  const skipToPrevious = () => {
    songSlider.current.scrollToOffset({
      offset: (songIndex - 1) * width,
    });
  };
  const renderSong = ({item, index}) => {
    return (
      <Animated.View style={style.mainImageWrapper}>
        <View style={[style.imageWrapper, style.elevatison]}>
          <Image source={item.artwork} style={style.musicImage} />
        </View>
      </Animated.View>
    );
  };
  return (
    <SafeAreaView style={style.container}>
      <View style={style.maincontainer}>
        {/* image */}
        <Animated.FlatList
          ref={songSlider}
          renderItem={renderSong}
          data={songs}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {x: srcollX},
                },
              },
            ],
            {useNativeDriver: true},
          )}
        />
        {/* song content */}
        <View>
          <Text style={[style.songContent, style.songTitle]}>
            {songs[songIndex].title}
          </Text>
          <Text style={[style.songContent, style.songArtist]}>
            {songs[songIndex].artist}
          </Text>
        </View>
        {/* slider */}
        <View>
          <Slider
            style={style.progressbar}
            value={progress.position}
            minimumValue={0}
            maximumValue={progress.duration}
            thumbTintColor="#EEEEEE"
            minimumTrackTintColor="#EEEEEE"
            maximumTrackTintColor="#EEEEEE"
            onValueChange={handleSliderChange} // Xử lý sự kiện khi người dùng di chuyển Slider
          />
          {/* music propress durattions */}
          <View style={style.progressLevelDuration}>
            <Text style={style.propressLabelText}>
              {new Date(progress.position * 1000)
                .toLocaleTimeString()
                .substring(3)}
            </Text>
            <Text style={style.propressLabelText}>
              {new Date(progress.duration * 1000)
                .toLocaleTimeString()
                .substring(3)}
            </Text>
          </View>
        </View>
        {/* music controls*/}
        <View style={style.musicControlContainer}>
          <TouchableOpacity onPress={skipToPrevious}>
            <Ionicons name="play-skip-back-outline" size={35} color="#EEEEEE" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              togglePlayBack(PlaybackState); // Chuyển đổi trạng thái phát nhạc
              setIsPlaying(!isPlaying); // Chuyển đổi trạng thái của biến isPlaying
            }}>
            <Ionicons
              name={isPlaying ? 'pause-circle-sharp' : 'play-circle-sharp'} // Sử dụng biến isPlaying để xác định icon
              size={80}
              color="#EEEEEE"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={skipToNext}>
            <Ionicons
              name="play-skip-forward-outline"
              size={35}
              color="#EEEEEE"
            />
          </TouchableOpacity>
        </View>
        {/* music */}
      </View>
      <View style={style.bottomContainer}>
        <View style={style.bottomIconWrapper}>
          <TouchableOpacity onPress={handlePress}>
            <Ionicons
              name={isPressed ? 'heart' : 'heart-outline'}
              size={30}
              color={isPressed ? '#FF69B4' : '#888888'}
            />
          </TouchableOpacity>

          <TouchableOpacity>
            <Ionicons name="repeat" size={30} color="#888888" />
          </TouchableOpacity>

          <TouchableOpacity>
            <Ionicons name="share-outline" size={30} color="#888888" />
          </TouchableOpacity>

          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={30} color="#888888" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MusicPlayer;
const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#555',
  },

  maincontainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    width: width,
    alignItems: 'center',
    paddingVertical: 15,
    borderTopColor: '#393E46',
  },
  bottomIconWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  imageWrapper: {
    width: 300,
    height: 340,
    marginBottom: 25,
  },
  musicImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  elevatison: {
    elevatison: 5,

    shadowColor: '#ccc',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  songArtist: {
    fontSize: 16,
    fontWeight: '300',
  },
  songContent: {
    textAlign: 'center',
    color: '#EEEEEE',
  },
  progressbar: {
    width: 350,
    height: 40,
    margin: 25,
    flexDirection: 'row',
  },
  propressLabelText: {
    color: '#EEEEEE',
    fontWeight: '500',
  },
  progressLevelDuration: {
    width: 370,
    paddingLeft: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  musicControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '60%',
    marginTop: 15,
  },
  mainImageWrapper: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
