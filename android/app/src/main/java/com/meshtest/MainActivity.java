package com.meshtest;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;

import android.util.Log;
import android.os.Bundle;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.janeasystems.rn_nodejs_mobile.RNNodeJsMobileModule;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MainActivity extends ReactActivity {

  private RNNodeJsMobileModule nodejsModule;

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    try {
      this.maybeStartNodejs();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  void maybeStartNodejs() throws Exception {
    if (this.nodejsModule != null) {
      try {
        this.nodejsModule.startNodeProject("main.js", Arguments.createMap());
      } catch (Exception e) {
        Log.e("NODEJS-RN", "startNodeProject failed to run main.js");
      }
      return;
    }
    ReactNativeHost host = this.getReactNativeHost();
    if (host == null) {
      throw new Exception("maybeStartNodejs() failed because of no ReactNativeHost");
    }
    ReactInstanceManager manager = host.getReactInstanceManager();
    if (manager == null) {
      throw new Exception("maybeStartNodejs() failed because of no ReactInstanceManager");
    }
    manager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
      @Override
      public void onReactContextInitialized(ReactContext context) {
        nodejsModule = context.getNativeModule(RNNodeJsMobileModule.class);
        try {
          nodejsModule.startNodeProject("main.js", Arguments.createMap());
        } catch (Exception e) {
          Log.e("NODEJS-RN", "startNodeProject failed to run main.js");
        }
        manager.removeReactInstanceEventListener(this);
      }
    });
  }

  @Override
  protected void onResume() {
    super.onResume();
    emitIfPossible("resumed");
  }

  @Override
  protected void onPause() {
    super.onPause();
    emitIfPossible("paused");
  }

  void emitIfPossible(String value) {
    ReactNativeHost host = this.getReactNativeHost();
    if (host == null) return;
    ReactInstanceManager manager = host.getReactInstanceManager();
    if (manager == null) return;
    ReactContext context = manager.getCurrentReactContext();
    if (context == null) return;
    DeviceEventManagerModule.RCTDeviceEventEmitter module = context
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    if (module == null) return;
    module.emit("activityLifecycle", value);
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "MeshTest";
  }

//  @Override
//  protected ReactActivityDelegate createReactActivityDelegate() {
//    return new ReactActivityDelegate(this, getMainComponentName()) {
//      @Override
//      protected ReactRootView createRootView() {
//        return new RNGestureHandlerEnabledRootView(MainActivity.this);
//      }
//    };
//  }
}
